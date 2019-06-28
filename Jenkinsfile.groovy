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
    image: mhart/alpine-node:latest
    tty: true
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
"""
        }
    }
    stages {
        stage('Test') {
            steps {
                container('node') {
                    git url: 'https://github.com/overture-stack/lectern.git', branch: 'master'
                    sh "npm ci %% npm run build"
                }
            }
        }
       // publish the edge tag
        stage('Publish Develop') {
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
                    sh "docker  build --network=host -f Dockerfile -t overture/lectern:edge"
                    sh "docker push overture/lectern:edge"
               }
            }
        }
    }
}