pipeline {
  agent any
  environment {
    REGISTRY = "docker.io/hardik144"
    FRONTEND_IMAGE = "${env.REGISTRY}/lawfirm-frontend"
    BACKEND_IMAGE = "${env.REGISTRY}/lawfirm-backend"
  }
  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }
    stage('Build Docker Images') {
      steps {
        sh '''
        docker build -t $BACKEND_IMAGE ./backend
        docker build -t $FRONTEND_IMAGE ./frontend
        '''
      }
    }
    stage('Push Images to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
          echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
          docker push $BACKEND_IMAGE
          docker push $FRONTEND_IMAGE
          '''
        }
      }
    }
    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh '''
          kubectl apply -f devops/kubernetes/k8s/
          '''
        }
      }
    }
  }
}
