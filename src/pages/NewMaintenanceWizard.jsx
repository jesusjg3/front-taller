import React, { useState } from 'react';
import '../styles/NewMaintenance.css';

// Importar los pasos desde sus archivos separados
import StepClient from './wizard/StepClient';
import StepVehicle from './wizard/StepVehicle';
import StepService from './wizard/StepService';
import StepSummary from './wizard/StepSummary';

const NewMaintenanceWizard = () => {
    const [step, setStep] = useState(1);

    // Estado Global del Wizard
    const [formData, setFormData] = useState({
        client: null,
        vehicle: null,
        service: {
            description: '',
            mileage: '',
            parts: [],
            labor: []
        }
    });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const renderStep = () => {
        switch (step) {
            case 1: return <StepClient onNext={nextStep} formData={formData} setFormData={setFormData} />;
            case 2: return <StepVehicle onNext={nextStep} onPrev={prevStep} formData={formData} setFormData={setFormData} />;
            case 3: return <StepService onNext={nextStep} onPrev={prevStep} formData={formData} setFormData={setFormData} />;
            case 4: return <StepSummary onPrev={prevStep} formData={formData} />;
            default: return null;
        }
    };

    return (
        <div className="wizard-container">
            <div className="wizard-header">
                <h2>Nuevo Servicio de Mantenimiento</h2>
                <p>Complete los pasos para registrar el servicio</p>
            </div>

            <div className="wizard-steps">
                <div className={`step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div> Cliente
                </div>
                <div className={`step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div> Vehículo
                </div>
                <div className={`step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
                    <div className="step-number">3</div> Servicio
                </div>
                <div className={`step-item ${step === 4 ? 'active' : ''}`}>
                    <div className="step-number">4</div> Resumen
                </div>
            </div>

            <div className="wizard-content">
                {renderStep()}
            </div>
        </div>
    );
};

export default NewMaintenanceWizard;
