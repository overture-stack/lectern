String podSpec = '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:18.16.1-bookworm-slim
    tty: true
    env: 
    - name: DOCKER_HOST
      value: tcp://localhost:2375
    - name: HOME
      value: /home/jenkins/agent
  - name: dind-daemon 
    image: docker:18.06-dind
    securityContext: 
        privileged: true 
        runAsUser: 0
    volumeMounts: 
      - name: docker-graph-storage 
        mountPath: /var/lib/docker 
  - name: docker
    image: docker:18-git
    tty: true
    env: 
    - name: DOCKER_HOST 
      value: tcp://localhost:2375
    - name: HOME
      value: /home/jenkins/agent
  securityContext:
    runAsUser: 1000
  volumes:
  - name: docker-graph-storage 
    emptyDir: {}
'''

pipeline {

    agent {
        kubernetes {
            yaml podSpec
        }
    }

    environment {
      containerRegistry = "ghcr.io"
      organization = "overture-stack" 
      appName = "lectern"
      gitHubRepo = "${organization}/${appName}"
      containerImageName = "${containerRegistry}/${gitHubRepo}"
      
      commit = sh(returnStdout: true, script: 'git describe --always').trim()
      version = sh(returnStdout: true, script: 'cat package.json | grep version | cut -d \':\' -f2 | sed -e \'s/"//\' -e \'s/",//\'').trim()

      slackNotificationsUrl = credentials('OvertureSlackJenkinsWebhookURL')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        stage('Prepare') {
            steps {
                container('node') {
                    sh "npx --yes pnpm install"
                }
            }
        }

        stage('Test') {
            steps {
                container('node') {
                    sh "npx --yes pnpm test:all"
                }
            }
        }

        stage('Build') {
            steps {
                container('docker') {
                    // the network=host needed to download dependencies using the host network (since we are inside 'docker' container)
                    sh "docker build --build-arg=COMMIT=${commit} --network=host -f apps/server/Dockerfile . -t server:${commit}"
                }
                
            }
        }

        stage('Git Tags') {
            when {
                branch 'main'
            }
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: 'OvertureBioGithub',
                        passwordVariable: 'GIT_PASSWORD',
                        usernameVariable: 'GIT_USERNAME'
                    )]) {
                        sh "git tag v${version}"
                        sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/${gitHubRepo} --tags"
                    }
                }
            }
        }

        stage('Publish Image') {
            when {
              anyOf {
                branch "main"
                branch "develop"
              }
            }
            steps {
               container('docker') {
                    withCredentials([usernamePassword(credentialsId:'OvertureBioGithub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh 'docker login ghcr.io -u $USERNAME -p $PASSWORD'
                    }
                    script {
                        if (env.BRANCH_NAME ==~ 'main') { // push latest and version tags
                            sh "docker tag server:${commit} ${containerImageName}:${version}"
                            sh "docker push ${containerImageName}:${version}"

                            sh "docker tag server:${commit} ${containerImageName}:latest"
                            sh "docker push ${containerImageName}:latest"
                        } else { // push commit tag
                            sh "docker tag server:${commit} ${containerImageName}:${commit}"
                            sh "docker push ${containerImageName}:${commit}"
                        }

                        if (env.BRANCH_NAME ==~ 'develop') { // push edge tag
                            sh "docker tag server:${commit} ${containerImageName}:edge"
                            sh "docker push ${containerImageName}:edge"
                        }
                    }

               }
            }
        }
    }

     post {
        failure {
            container('node') {
                script {
                    if (env.BRANCH_NAME ==~ /(develop|main|\S*[Tt]est\S*)/) {
                        sh "curl \
                            -X POST \
                            -H 'Content-type: application/json' \
                            --data '{ \
                                \"text\":\"Build Failed: ${env.JOB_NAME}#${commit} \
                                \n[Build ${env.BUILD_NUMBER}] (${env.BUILD_URL})\" \
                            }' \
                            ${slackNotificationsUrl}"
                    }
                }
            }
        }

        fixed {
            container('node') {
                script {
                    if (env.BRANCH_NAME ==~ /(develop|main|\S*[Tt]est\S*)/) {
                        sh "curl \
                            -X POST \
                            -H 'Content-type: application/json' \
                            --data '{ \
                                \"text\":\"Build Fixed: ${env.JOB_NAME}#${commit} \
                                \n[Build ${env.BUILD_NUMBER}] (${env.BUILD_URL})\" \
                            }' \
                            ${slackNotificationsUrl}"
                    }
                }
            }
        }

        success {
            container('node') {
                script {
                    if (env.BRANCH_NAME ==~ /(\S*[Tt]est\S*)/) {
                        sh "curl \
                            -X POST \
                            -H 'Content-type: application/json' \
                            --data '{ \
                                \"text\":\"Build tested: ${env.JOB_NAME}#${commit} \
                                \n[Build ${env.BUILD_NUMBER}] (${env.BUILD_URL})\" \
                            }' \
                            ${slackNotificationsUrl}"
                    }
                }
            }
        }
    }
}
