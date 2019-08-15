def commit = "UNKNOWN"

pipeline {
    agent {
        kubernetes {
            label 'lectern-executor'
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:8.16.0-jessie
    tty: true
    env: 
      - name: DOCKER_HOST 
        value: tcp://localhost:2375 
  - name: dind-daemon 
    image: docker:18.06-dind
    securityContext: 
        privileged: true 
    volumeMounts: 
      - name: docker-graph-storage 
        mountPath: /var/lib/docker 
  - name: helm
    image: alpine/helm:2.12.3
    tty: true
    command:
    - cat
  - name: docker
    image: docker:18-git
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
      type: File
  - name: docker-graph-storage 
    emptyDir: {}
"""
        }
    }
    stages {
        stage('Prepare') {
            steps {
                script {
                    commit = sh(returnStdout: true, script: 'git describe --always').trim()
                }
                script {
                    version = sh(returnStdout: true, script: 'cat package.json | grep version | cut -d \':\' -f2 | sed -e \'s/"//\' -e \'s/",//\'').trim()
                }
            }
        }
        stage('Test') {
            steps {
                container('node') {
                    sh "npm ci"
                    sh "npm run test"
                }
            }
        }
        stage('Build') {
            steps {
                container('node') {
                    sh "npm ci"
                    sh "npm run build"
                }
            }
        }
       // publish the edge tag
        stage('Publish Develop (edge)') {
            when {
                branch "develop"
            }
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId:'OvertureDockerHub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh 'docker login -u $USERNAME -p $PASSWORD'
                    }

                    // the network=host needed to download dependencies using the host network (since we are inside 'docker'
                    // container)
                    sh "docker build --network=host -f Dockerfile . -t overture/lectern:edge"
                    sh "docker push overture/lectern:edge"
               }
            }
        }

        stage('Release & tag') {
          when {
            branch "master"
          }
          steps {
              container('docker') {
                  withCredentials([usernamePassword(credentialsId: 'OvertureBioGithub', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                      sh "git tag ${version}"
                      sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/overture-stack/lectern --tags"
                  }
                  withCredentials([usernamePassword(credentialsId:'OvertureDockerHub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                      sh 'docker login -u $USERNAME -p $PASSWORD'
                  }
                  sh "docker  build --network=host -f Dockerfile . -t overture/lectern:latest -t overture/lectern:${version}"
                  sh "docker push overture/lectern:${version}"
                  sh "docker push overture/lectern:latest"
             }
          }
        }

        stage('Deploy to Overture QA') {
            when {
                  branch "develop"
            }
            steps {
                container('helm') {
                    withCredentials([file(credentialsId:'4ed1e45c-b552-466b-8f86-729402993e3b', variable: 'KUBECONFIG')]) {
                        sh 'env'
                        sh 'helm init --client-only'
                        sh "helm ls --kubeconfig $KUBECONFIG"
                        sh "helm repo add overture https://overture-stack.github.io/charts-server/"
                        sh """
                            helm upgrade --kubeconfig $KUBECONFIG --install --namespace=overture-qa lectern-overture-qa \\
                            overture/lectern --reuse-values --recreate-pods
                           """
                    }
                }
            }
        }

        stage('Deploy to Overture Staging') {
            when {
                  branch "master"
            }
            steps {
                container('helm') {
                    withCredentials([file(credentialsId:'4ed1e45c-b552-466b-8f86-729402993e3b', variable: 'KUBECONFIG')]) {
                        sh 'env'
                        sh 'helm init --client-only'
                        sh "helm ls --kubeconfig $KUBECONFIG"
                        sh "helm repo add overture https://overture-stack.github.io/charts-server/"
                        sh """
                            helm upgrade --kubeconfig $KUBECONFIG --install --namespace=overture-staging lectern-overture-staging \\
                            overture/lectern --reuse-values --recreate-pods
                           """
                    }
                }
            }
        }
        
    }
}
