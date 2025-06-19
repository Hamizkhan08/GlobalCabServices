import os

from flask import Flask, flash, redirect, render_template, request, url_for
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a secure key

# Twilio configuration (if you want to send SMS)
TWILIO_ACCOUNT_SID = 'AC3cb9bfd3a68b33f2cdcc488aa649ba6f'
TWILIO_AUTH_TOKEN = '0245f6822ef17a52de4a8d6f82dbbb71'
TWILIO_PHONE_NUMBER = '+917387220667'
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# File to store view count (if needed)
VIEW_COUNT_FILE = 'view_count.txt'

def get_view_count():
    if not os.path.exists(VIEW_COUNT_FILE):
        with open(VIEW_COUNT_FILE, 'w') as f:
            f.write('0')
    with open(VIEW_COUNT_FILE, 'r') as f:
        try:
            count = int(f.read().strip())
        except ValueError:
            count = 0
    count += 1
    with open(VIEW_COUNT_FILE, 'w') as f:
        f.write(str(count))
    return count

def send_email_via_sendgrid(subject, message_body, recipient):
    message = Mail(
        from_email='your_verified_sender@example.com',  # Must be a verified sender in SendGrid
        to_emails=recipient,
        subject=subject,
        plain_text_content=message_body
    )
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print("SendGrid response:", response.status_code)
    except Exception as e:
        print("SendGrid error:", e)

@app.route('/')
def index():
    view_count = get_view_count()  # Increment and get view count
    return render_template('index.html', view_count=view_count)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/online_booking')
def online_booking():
    return render_template('online_booking.html')

@app.route('/book', methods=['POST'])
def book():
    # Get form data
    pickup = request.form.get('pickup')
    dropoff = request.form.get('dropoff')
    date = request.form.get('date')
    time_val = request.form.get('time')
    phone = request.form.get('phone')  # This can be used if you want to reply via SMS/WhatsApp

    # Construct message body for WhatsApp
    message_body = f"""New Booking Request:
Pickup Location: {pickup}
Drop Location: {dropoff}
Date: {date}
Time: {time_val}
Phone: {phone}"""

    try:
        # Send WhatsApp message using Twilio's API
        message = twilio_client.messages.create(
            body=message_body,
            from_='whatsapp:+14155238886',  # Your Twilio Sandbox/WhatsApp-enabled number
            to='whatsapp:+917387220667'  # Replace with your business WhatsApp number (include country code)
        )
        flash("Your booking request has been sent via WhatsApp!", "success")
    except Exception as e:
        flash("An error occurred while sending your booking request via WhatsApp.", "danger")
        print("WhatsApp send error:", e)

    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
