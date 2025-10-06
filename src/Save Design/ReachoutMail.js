export const sendEmail = async (name, email) => {
  const lambdaEndpoint = 'https://hy82gexng7.execute-api.ap-south-1.amazonaws.com/dev/email/sendReachoutMail';

  const payload = {
    name,
    email
  };

  try {
    const response = await fetch(lambdaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add an auth header if required:
        // 'Authorization': `Bearer ${yourToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lambda call failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Lambda response:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};