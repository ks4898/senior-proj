document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }
});

async function handlePayment(event) {
    event.preventDefault();
    const amount = document.getElementById('amount').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;

    try {
        const response = await fetch('/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount, cardNumber, expiryDate, cvv }),
        });

        if (!response.ok) {
            throw new Error('Payment failed');
        }

        const result = await response.json();
        alert('Payment successful!');
        // Redirect or update UI as needed
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
    }
}