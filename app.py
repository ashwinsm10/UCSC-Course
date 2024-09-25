import atexit
from flask_cors import CORS
from flask import Flask, jsonify, request
from apscheduler.schedulers.background import BackgroundScheduler
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
from src.services.major_courses import get_all_major_courses
from src.services.ucsc_courses import get_courses
import pytz

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///courses.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
class Degree(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    courses = db.relationship('Course', backref='degree', lazy=True)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(1000), nullable=False)
    course_type = db.Column(db.String(50), nullable=False)
    degree_id = db.Column(db.Integer, db.ForeignKey('degree.id'), nullable=False)

class CourseModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ge = db.Column(db.String(5))
    code = db.Column(db.String(10))
    name = db.Column(db.String(30))
    instructor = db.Column(db.String(20))
    link = db.Column(db.String(200))
    class_count = db.Column(db.Integer)
    enroll_num = db.Column(db.Integer)
    class_type = db.Column(db.String(19))
    schedule= db.Column(db.String(25))
    location = db.Column(db.String(20))
    timestamp = db.Column(db.DateTime, default=datetime.now(tz=pytz.utc))


def create_db():
    with app.app_context():
        db.create_all()
        

last_update_time = None

def get_last_update():
    global last_update_time
    if last_update_time is None:
        last_update_time = datetime.now(pytz.timezone('America/Los_Angeles'))
    elif isinstance(last_update_time, str):
        last_update_time = datetime.fromisoformat(last_update_time)
    
    return jsonify({"last_update": last_update_time.isoformat()})


def update_all_courses():
    with app.app_context():
        all_courses = get_all_major_courses()
        
        for degree_name, course_data in all_courses.items():
            degree = Degree.query.filter_by(name=degree_name).first()
            if not degree:
                degree = Degree(name=degree_name)
                db.session.add(degree)
            
            Course.query.filter_by(degree_id=degree.id).delete()
            
            for course_type, courses in course_data.items():
                for course_code in courses:
                    course = Course(course_code=course_code, course_type=course_type, degree=degree)
                    db.session.add(course)
        
        db.session.commit()
        print("All courses updated successfully")
        
def store_courses_in_db():
    global last_update_time
    with app.app_context():
        try:
            CourseModel.query.delete()
            categories = [
                "CC", "ER", "IM", "MF", "SI", "SR", "TA", "PE-E", "PE-H", "PE-T", 
                "PR-E", "PR-C", "PR-S", "C1", "C2"
            ]
            for category in categories:
                for course in get_courses(category):
                    db.session.add(CourseModel(
                        ge=category,
                        code=course.code,
                        name=course.name,
                        instructor=course.instructor,
                        link=course.link,
                        class_count=course.class_count,
                        enroll_num=course.enroll_num,
                        class_type=course.class_type,
                        schedule=course.schedule,
                        location = course.location,
                    ))
            db.session.commit()
            last_update_time = datetime.now(pytz.timezone('America/Los_Angeles'))
            print("Courses updated in database.")
        except Exception as e:
            print(f"Error storing courses: {e}")

def schedule_jobs():
    scheduler = BackgroundScheduler()
    # Schedule update_all_courses to run every 3 weeks
    scheduler.add_job(update_all_courses, 'interval', weeks=3, id='update_all_courses_job')
    # Schedule store_courses_in_db to run every minute
    scheduler.add_job(store_courses_in_db, 'interval', seconds=60, id='store_courses_in_db_job')
    scheduler.start()

@app.route('/api/last_update', methods=['GET'])
def last_update():
    return get_last_update()

@app.route('/api/courses/<degree_name>', methods=['GET'])
def get_courses_major(degree_name):
    degree = Degree.query.filter_by(name=degree_name).first()
    if not degree:
        return jsonify({"error": "Degree not found"}), 404
    
    courses = Course.query.filter_by(degree_id=degree.id).all()
    course_list = {}
    for course in courses:
        if course.course_type not in course_list:
            course_list[course.course_type] = []
        course_list[course.course_type].append(course.course_code)
    
    return jsonify(course_list)

@app.route('/api/degrees', methods=['GET'])
def get_all_degrees():
    degrees = Degree.query.all()
    return jsonify([degree.name for degree in degrees])

@app.route('/api/courses', methods=['GET'])
def get_courses_data():
    course_filter = request.args.get('course', 'AnyGE')
    query = CourseModel.query.filter_by(ge=course_filter) if course_filter != 'AnyGE' else CourseModel.query
    data = [{
        "ge": course.ge,
        "code": course.code,
        "name": course.name,
        "instructor": course.instructor,
        "link": course.link,
        "class_count": course.class_count,
        "enroll_num": course.enroll_num,
        "class_type": course.class_type,
        "schedule": course.schedule,
        "location": course.location,
    } for course in query.all()]
    return jsonify({"data": data})

if __name__ == '__main__':
    with app.app_context():
            print("Initializing database with initial data...")
            create_db()
            store_courses_in_db()

            update_all_courses()
        
    # Start the scheduler for periodic updates
    schedule_jobs()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5001)