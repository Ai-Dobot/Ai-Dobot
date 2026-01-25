// Application State
const appState = {
    status: 'available', // 'available' or 'busy'
    currentCall: null,
    callInterval: null
};

// Sample patient data for simulation
const samplePatients = [
    {
        patient_name: 'John Smith',
        patient_id: 'PAT-001',
        symptom: 'Fever and cough for 3 days'
    },
    {
        patient_name: 'Sarah Johnson',
        patient_id: 'PAT-002',
        symptom: 'Chest pain and shortness of breath'
    },
    {
        patient_name: 'Michael Brown',
        patient_id: 'PAT-003',
        symptom: 'Headache and dizziness'
    },
    {
        patient_name: 'Emily Davis',
        patient_id: 'PAT-004',
        symptom: 'Abdominal pain and nausea'
    },
    {
        patient_name: 'Robert Wilson',
        patient_id: 'PAT-005',
        symptom: 'Sore throat and fatigue'
    }
];

/**
 * Update doctor status display
 */
function updateStatus() {
    const statusElement = document.getElementById('doctorStatus');
    
    if (appState.status === 'available') {
        statusElement.textContent = 'Available';
        statusElement.className = 'status-indicator status-available';
    } else {
        statusElement.textContent = 'Busy';
        statusElement.className = 'status-indicator status-busy';
    }
}

/**
 * Show incoming call alert with patient information
 */
function showIncomingCall(patientData) {
    // Update UI elements
    document.getElementById('patientName').textContent = patientData.patient_name;
    document.getElementById('patientId').textContent = patientData.patient_id;
    document.getElementById('patientSymptoms').textContent = patientData.symptom;
    
    // Show incoming call alert
    document.getElementById('incomingCallAlert').style.display = 'block';
    document.getElementById('idleState').style.display = 'none';
    
    // Update status to busy
    appState.status = 'busy';
    appState.currentCall = patientData;
    updateStatus();
}

/**
 * Hide incoming call alert
 */
function hideIncomingCall() {
    document.getElementById('incomingCallAlert').style.display = 'none';
    document.getElementById('idleState').style.display = 'block';
}

/**
 * Accept the incoming call
 */
function acceptCall() {
    if (!appState.currentCall) {
        return;
    }
    
    // Hide incoming call alert
    hideIncomingCall();
    
    // Show video container
    document.getElementById('videoPlaceholder').style.display = 'none';
    document.getElementById('videoContainer').style.display = 'block';
    document.getElementById('endCallBtn').style.display = 'block';
    
    // Load Jitsi iframe
    const jitsiUrl = 'https://meet.jit.si/AmazedResortsStoreAnnually';
    const iframe = document.getElementById('jitsiFrame');
    iframe.src = jitsiUrl;
    
    // Update status
    appState.status = 'busy';
    updateStatus();
    
    // Stop call simulation
    stopCallSimulation();
}

/**
 * End the current call
 */
function endCall() {
    // Hide video container
    document.getElementById('videoContainer').style.display = 'none';
    document.getElementById('videoPlaceholder').style.display = 'flex';
    document.getElementById('endCallBtn').style.display = 'none';
    
    // Clear Jitsi iframe
    const iframe = document.getElementById('jitsiFrame');
    iframe.src = '';
    
    // Reset state
    appState.currentCall = null;
    appState.status = 'available';
    updateStatus();
    
    // Show idle state
    document.getElementById('idleState').style.display = 'block';
    
    // Restart call simulation after a delay
    setTimeout(() => {
        startCallSimulation();
    }, 5000); // Wait 5 seconds before next call
}

/**
 * Reject the incoming call
 */
function rejectCall() {
    // Hide incoming call alert
    hideIncomingCall();
    
    // Reset state
    appState.currentCall = null;
    appState.status = 'available';
    updateStatus();
    
    // Continue simulation
    // (Call simulation will continue automatically)
}

/**
 * Start simulating incoming calls
 */
function startCallSimulation() {
    // Clear any existing interval
    if (appState.callInterval) {
        clearInterval(appState.callInterval);
    }
    
    // Simulate first call after 5 seconds
    setTimeout(() => {
        if (appState.status === 'available' && !appState.currentCall) {
            const randomPatient = samplePatients[Math.floor(Math.random() * samplePatients.length)];
            showIncomingCall(randomPatient);
        }
    }, 5000);
    
    // Then simulate calls every 30-60 seconds
    appState.callInterval = setInterval(() => {
        if (appState.status === 'available' && !appState.currentCall) {
            const randomPatient = samplePatients[Math.floor(Math.random() * samplePatients.length)];
            showIncomingCall(randomPatient);
        }
    }, 30000 + Math.random() * 30000); // Random interval between 30-60 seconds
}

/**
 * Stop call simulation
 */
function stopCallSimulation() {
    if (appState.callInterval) {
        clearInterval(appState.callInterval);
        appState.callInterval = null;
    }
}

/**
 * Initialize the application
 */
function init() {
    // Set initial status
    updateStatus();
    
    // Start call simulation
    startCallSimulation();
}

// Start application when page loads
window.addEventListener('DOMContentLoaded', init);

