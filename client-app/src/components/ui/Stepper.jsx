import './ui.css';

export function Stepper({ currentStep, steps }) {
  return (
    <div className="stepper" role="navigation" aria-label="Progresso do formulário">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div
            key={stepNumber}
            className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="stepper-number">
              {isCompleted ? '✓' : stepNumber}
            </div>
            <div className="stepper-label">{step.label}</div>
            {index < steps.length - 1 && <div className="stepper-line" />}
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
