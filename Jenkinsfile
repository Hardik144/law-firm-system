pipeline {
  agent any

  environment {
    REGISTRY = "your-registry.example.com"
    FRONTEND_IMAGE = "${env.REGISTRY}/lawfirm-frontend"
    BACKEND_IMAGE = "${env.REGISTRY}/lawfirm-backend"
    KUBE_NAMESPACE = "default"
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'cd backend && npm install'
        sh 'cd frontend && npm install'
      }
    }

    stage('Run tests') {
      steps {
        sh 'cd backend && npm test'
        sh 'cd frontend && npm run build'
      }
    }

    stage('Build Docker images') {
      steps {
        sh 'docker build -t $BACKEND_IMAGE:latest backend'
        sh 'docker build -t $FRONTEND_IMAGE:latest frontend'
      }
    }

    stage('Push images') {
      steps {
        sh 'docker push $BACKEND_IMAGE:latest'
        sh 'docker push $FRONTEND_IMAGE:latest'
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh 'kubectl -n $KUBE_NAMESPACE apply -f devops/kubernetes/k8s/'
      }
    }
  }
}

