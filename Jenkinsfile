pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'dracon24' 
        DOCKERHUB_IMAGE = 'api-monitor'
    }

    stages {
        stage('Clone Repo') {
            steps {
                echo 'Cloning source code...'
                // Jenkins already clones the repo if Git is configured
            }
        }

        stage('Node.js App - Install & Test') {
            steps {
                dir('api-monitor') {
                    echo 'Installing Node.js dependencies...'
                    sh 'npm install'
                    echo 'Running Jest tests...'
                    sh 'npm test'
                }
            }
        }

        stage('Java App - Maven Test') {
            steps {
                dir('dummy-java-test') {
                    echo 'Running Maven + JUnit tests...'
                    sh 'mvn clean test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('api-monitor') {
                    echo 'Building Docker image...'
                    sh "docker build -t $DOCKERHUB_USERNAME/$DOCKERHUB_IMAGE:latest ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
                    sh "docker push $DOCKERHUB_USERNAME/$DOCKERHUB_IMAGE:latest"
                }
            }
        }
    }
}
