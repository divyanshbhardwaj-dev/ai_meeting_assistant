from apscheduler.schedulers.background import BackgroundScheduler
from app.services.google_calendar_worker import process_calendar_events

scheduler = BackgroundScheduler()

def start_scheduler():
    scheduler.add_job(process_calendar_events, "interval", minutes=2)
    scheduler.start()