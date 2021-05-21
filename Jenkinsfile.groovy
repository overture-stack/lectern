def commit = "UNKNOWN"
def dockerRepo = "ghcr.io/overture-stack" 
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
                container('docker') {
                    // the network=host needed to download dependencies using the host network (since we are inside 'docker'
                    // container)
                    sh "docker build --build-arg=COMMIT=${commit} --network=host -f Dockerfile . -t overture/lectern:${commit} -t ${dockerRepo}/lectern:${commit}"
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
                    sh "docker tag overture/lectern:${commit} overture/lectern:edge"
                    sh "docker push overture/lectern:${commit}"
                    sh "docker push overture/lectern:edge"
               }
               container('docker') {
                    withCredentials([usernamePassword(credentialsId:'OvertureBioGithub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh 'docker login ghcr.io -u $USERNAME -p $PASSWORD'
                    }
                    sh "docker tag ${dockerRepo}/lectern:${commit} ${dockerRepo}/lectern:edge"
                    sh "docker push ${dockerRepo}/lectern:${commit}"
                    sh "docker push ${dockerRepo}/lectern:edge"
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
                  sh "docker tag overture/lectern:${commit} overture/lectern:${version}"
                  sh "docker tag overture/lectern:${commit} overture/lectern:latest"
                  sh "docker push overture/lectern:${version}"
                  sh "docker push overture/lectern:latest"
             }
             container('docker') {
                  withCredentials([usernamePassword(credentialsId:'OvertureBioGithub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                      sh 'docker login ghcr.io -u $USERNAME -p $PASSWORD'
                  }
                  sh "docker tag ${dockerRepo}/lectern:${commit} ${dockerRepo}/lectern:${version}"
                  sh "docker tag ${dockerRepo}/lectern:${commit} ${dockerRepo}/lectern:latest"
                  sh "docker push ${dockerRepo}/lectern:${version}"
                  sh "docker push ${dockerRepo}/lectern:latest"
             }
          }
        }

		stage('Deploy to Overture QA') {
			when {
				branch "develop"
			}
			steps {
				build(job: "/Overture.bio/provision/helm", parameters: [
						[$class: 'StringParameterValue', name: 'OVERTURE_ENV', value: 'qa' ],
						[$class: 'StringParameterValue', name: 'OVERTURE_CHART_NAME', value: 'lectern'],
						[$class: 'StringParameterValue', name: 'OVERTURE_RELEASE_NAME', value: 'lectern'],
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_CHART_VERSION', value: ''], // use latest
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_REPO_URL', value: "https://overture-stack.github.io/charts-server/"],
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_REUSE_VALUES', value: "false" ],
						[$class: 'StringParameterValue', name: 'OVERTURE_ARGS_LINE', value: "--set-string image.tag=${commit}" ]
				])
			}
		}

		stage('Deploy to Overture Staging') {
			when {
				branch "master"
			}
			steps {
				build(job: "/Overture.bio/provision/helm", parameters: [
						[$class: 'StringParameterValue', name: 'OVERTURE_ENV', value: 'staging' ],
						[$class: 'StringParameterValue', name: 'OVERTURE_CHART_NAME', value: 'lectern'],
						[$class: 'StringParameterValue', name: 'OVERTURE_RELEASE_NAME', value: 'lectern'],
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_CHART_VERSION', value: ''], // use latest
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_REPO_URL', value: "https://overture-stack.github.io/charts-server/"],
						[$class: 'StringParameterValue', name: 'OVERTURE_HELM_REUSE_VALUES', value: "false" ],
						[$class: 'StringParameterValue', name: 'OVERTURE_ARGS_LINE', value: "--set-string --set-string image.tag=${version}" ]
				])
			}
		}
        
    }
}
