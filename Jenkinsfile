pipeline {
  agent any
  environment {
    SONAR_HOST_URL = 'http://localhost:9000'
  }
  stages {
    stage('Build') {
      steps { sh 'docker build -t app .' }
    }
    stage('SAST') {
      steps {
        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
          sh 'docker run --rm --network host -e SONAR_HOST_URL -e SONAR_TOKEN -v "$WORKSPACE:/usr/src" sonarsource/sonar-scanner-cli'
        }
      }
    }
    stage('Security Scan') {
      steps { sh 'trivy image --severity HIGH,CRITICAL --exit-code 0 app | tee trivy-report.txt' }
    }
    stage('Deploy') {
      steps {
        sh 'docker save app -o app.tar && chmod 644 app.tar && sudo -u ubuntu minikube image load $WORKSPACE/app.tar'
        sh 'kubectl apply -f k8s/'
        sh 'kubectl rollout restart deployment/healthcare-app && kubectl rollout status deployment/healthcare-app --timeout=120s'
      }
    }
    stage('DAST') {
      steps {
        sh 'chmod 777 $WORKSPACE && docker run --rm --network host -v "$WORKSPACE:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://$(sudo -u ubuntu minikube ip):30300 -r zap-report.html -I'
      }
    }
  }
  post {
    always { archiveArtifacts artifacts: 'trivy-report.txt, zap-report.html', allowEmptyArchive: true }
  }
}
