import React from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Container,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Help = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%)',
      py: 8
    }}>
      <Container maxWidth="md" sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        p: 4,
        paddingTop: 10,
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            mb: 4,
            fontWeight: 'bold',
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          Frequently Asked Questions
        </Typography>

        <Box sx={{ 
          '& .MuiAccordion-root': {
            mb: 2,
            borderRadius: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:before': {
              display: 'none'
            }
          }
        }}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light'
                }
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                How to enroll to this application?
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 3 }}>
              <Typography component="div" variant="body1">
                Visit http://localhost:3000/signup to register on the platform.
                You have to provide the following details to the form:
                <ul>
                  <li>Name</li>
                  <li>Email Address</li>
                  <li>Password</li>
                </ul>
                Click on the submit button and you will be redirected to login
                page. To login, you have to provide your private key and click
                on the login button.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
              sx={{
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light'
                }
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                What is the procedure to register the property?
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 3 }}>
              <Typography component="div" variant="body1">
                To register the property, you must login to your account. Click
                on the dashboard and you will find three tabs there, then go to
                the "Register Land" tab where you will be asked to fill the
                details related the property and onwer. After submitting the
                form your application is then verified by the government
                authority.
                <br /><br />
                In "My Properties" section on the dashboard you can check the
                status of your land. If it is accepted by the government then
                you can make your land available to the buyers and if declined,
                you have to submit the new application.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
              sx={{
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light'
                }
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                How to buy the property?
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 3 }}>
              <Typography component="div" variant="body1">
                To buy the property, you must login to your account. Click on
                the dashboard and you will find three tabs there, then go to the
                "Available Properties" tab where you will find the available
                properties and you can request access to the land owner in order
                to buy.
                <br /><br />
                Land Owner will receive the request and they are allowed to
                accept/decline by verifying requester details. If accepted,
                buyer can now make transaction and the ownership of previous
                land will be removed and the amount get transferred to the land
                owner. If rejected, then land will again be available to the
                users.
                <br /><br />
                To check the wallet balance, they can visit to their profile
                section.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
    </Box>
  );
};

export default Help;