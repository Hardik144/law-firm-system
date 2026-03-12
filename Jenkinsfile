pipeline {
  agent any

  environment {
    // Docker Hub namespace
    REGISTRY = "docker.io/hardik144"
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
        // Backend currently has no real tests; keep command for future use
        sh 'cd backend && npm test || echo "no backend tests configured"'
        sh 'cd frontend && npm run build'
      }
    }

    stage('Build Docker images') {
      steps {
        script {
          def tag = env.BUILD_NUMBER
          sh "docker build -t $BACKEND_IMAGE:${tag} backend"
          sh "docker build -t $FRONTEND_IMAGE:${tag} frontend"
          // also tag as :latest for convenience
          sh "docker tag $BACKEND_IMAGE:${tag} $BACKEND_IMAGE:latest"
          sh "docker tag $FRONTEND_IMAGE:${tag} $FRONTEND_IMAGE:latest"
        }
      }
    }

    stage('Push images') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
          sh 'docker push $BACKEND_IMAGE:latest'
          sh 'docker push $FRONTEND_IMAGE:latest'
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh 'kubectl -n $KUBE_NAMESPACE apply -f devops/kubernetes/k8s/'
      }
    }
  }
}

