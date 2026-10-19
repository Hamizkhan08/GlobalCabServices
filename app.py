import os

from flask import Flask, flash, redirect, render_template, request, url_for

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a secure key

# Optional Twilio configuration (SMS/WhatsApp) - only used if credentials are set
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '+917387220667')

twilio_client = None
try:
    from twilio.rest import Client
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except ImportError:
    pass  # Twilio not installed – WhatsApp booking will be disabled

# File to store view count
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
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        message = Mail(
            from_email='your_verified_sender@example.com',
            to_emails=recipient,
            subject=subject,
            plain_text_content=message_body
        )
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print("SendGrid response:", response.status_code)
    except ImportError:
        print("SendGrid not installed – email notification skipped.")
    except Exception as e:
        print("SendGrid error:", e)

@app.route('/')
def index():
    view_count = get_view_count()
    return render_template('index.html', view_count=view_count)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/online_booking')
def online_booking():
    return render_template('online_booking.html')

@app.route('/book', methods=['POST'])
def book():
    pickup = request.form.get('pickup')
    dropoff = request.form.get('dropoff')
    date = request.form.get('date')
    time_val = request.form.get('time')
    phone = request.form.get('phone')

    message_body = f"""New Booking Request:
Pickup Location: {pickup}
Drop Location: {dropoff}
Date: {date}
Time: {time_val}
Phone: {phone}"""

    if twilio_client:
        try:
            message = twilio_client.messages.create(
                body=message_body,
                from_='whatsapp:+14155238886',
                to='whatsapp:+917387220667'
            )
            flash("Your booking request has been sent via WhatsApp!", "success")
        except Exception as e:
            flash("An error occurred while sending your booking request via WhatsApp.", "danger")
            print("WhatsApp send error:", e)
    else:
        flash("Booking received! We will contact you shortly.", "success")

    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
