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
                    sh "cd ./server && npm ci"
                }
            }
        }
    }
}