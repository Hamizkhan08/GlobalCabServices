import os
from datetime import datetime

from flask import (
    Flask,
    Response,
    flash,
    redirect,
    render_template,
    request,
    url_for,
)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'global_cab_services_secret_2026')

# Production site URL configuration (configurable via environment variable)
SITE_URL = os.environ.get('SITE_URL', 'https://globalcabservices.com').rstrip('/')

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
    pass

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

@app.context_processor
def inject_global_seo():
    return {
        'site_url': SITE_URL,
        'business_name': 'Global Cab Services',
        'primary_phone': '+91 9881598109',
                'primary_email': 'khanafzal0404@gmail.com',
        'google_reviews_url': 'https://g.page/r/Cd-LLnOEWd0wEBE/review',
        'location_name': 'Aman Paradise Appt, Wadala Rd, opp. JMCT Collage, Al Madina Colony, Sai Nath Nagar, Nashik, Maharashtra 422006',
        'address_street': 'Aman Paradise Appt, Wadala Rd, opp. JMCT Collage, Al Madina Colony, Sai Nath Nagar',
        'postal_code': '422006',
        'current_year': datetime.now().year,
    }

# -------------------------------------------------------------
# MAIN PAGES
# -------------------------------------------------------------
@app.route('/')
def index():
    view_count = get_view_count()
    return render_template('index.html', view_count=view_count)

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/fleet')
def fleet():
    return render_template('fleet.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/online_booking')
def online_booking():
    return render_template('online_booking.html')

# -------------------------------------------------------------
# SEO: ROBOTS.TXT & SITEMAP.XML
# -------------------------------------------------------------
@app.route('/robots.txt')
def robots():
    content = f"""User-agent: *
Allow: /
Disallow: /scratch/

# Sitemap location
Sitemap: {SITE_URL}/sitemap.xml
"""
    return Response(content, mimetype='text/plain')

@app.route('/sitemap.xml')
def sitemap():
    # Last modified date
    today = datetime.now().strftime('%Y-%m-%d')
    urls = [
        {'loc': f'{SITE_URL}/', 'priority': '1.0', 'changefreq': 'daily'},
        {'loc': f'{SITE_URL}/services', 'priority': '0.9', 'changefreq': 'weekly'},
        {'loc': f'{SITE_URL}/fleet', 'priority': '0.9', 'changefreq': 'weekly'},
        {'loc': f'{SITE_URL}/about', 'priority': '0.8', 'changefreq': 'monthly'},
        {'loc': f'{SITE_URL}/contact', 'priority': '0.8', 'changefreq': 'monthly'},
        {'loc': f'{SITE_URL}/online_booking', 'priority': '0.8', 'changefreq': 'weekly'},
    ]

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for u in urls:
        xml.append('  <url>')
        xml.append(f'    <loc>{u["loc"]}</loc>')
        xml.append(f'    <lastmod>{today}</lastmod>')
        xml.append(f'    <changefreq>{u["changefreq"]}</changefreq>')
        xml.append(f'    <priority>{u["priority"]}</priority>')
        xml.append('  </url>')
    xml.append('</urlset>')

    return Response('\n'.join(xml), mimetype='application/xml')

# -------------------------------------------------------------
# 404 ERROR HANDLER
# -------------------------------------------------------------
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# -------------------------------------------------------------
# LEGACY FORM HANDLER
# -------------------------------------------------------------
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
