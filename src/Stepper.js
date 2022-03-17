import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

let steps = [
  {
      label: "Start up",
      status: true
  },
  {
    label: 'Parsing CSV to Json',
    status: true
  },
  {
    label: 'Call api from local to server',
    status: true
  },
  {
    label: 'Zip file to download',
    status: true
  },
  {
    label: 'Completed download images',
    status: true
  },
];

export default function VerticalLinearStepper( { inputActiveStep,  isFailedStep} ) {
    const [activeStep, setActiveStep] = React.useState(inputActiveStep);
    React.useEffect(() => {
        if(isFailedStep !== null){
            if(inputActiveStep === 4){
                steps[4] = {
                    label: "Cann't perform action",
                    status: false
                }
                for(let i = isFailedStep; i < inputActiveStep; i++ ){
                    steps[i].status = false
                }
            }
        }
        setActiveStep(inputActiveStep)
      }, [inputActiveStep]);


  const handleReset = () => {
    setActiveStep(0);
  };

  return (
      
    <Box sx={{ maxWidth: 400, margin: "0 auto", }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => {
            const labelProps = {};
            if (!step.status) {
              labelProps.optional = (
                <Typography variant="caption" color="error">
                  Alert message
                </Typography>
              );
  
              labelProps.error = true;
            }
        
         return(
                <Step key={step.label}>
                    <StepLabel {...labelProps}>
                    {step.label}
                    </StepLabel>
                </Step>
            )
        })}
      </Stepper>
    </Box>
  );
}
