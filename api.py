from flask import Flask, jsonify, request
from src.services.ucsc_courses import get_courses
from src.services.course import Course  # Import the Course class

app = Flask(__name__)

@app.route('/api/courses', methods=['GET'])
def get_courses_data():
    course_filter = request.args.get('course', 'AnyGE')  # Get course filter from query parameters

    course_objects = get_courses(course_filter)

    data = [
        {
            "code": course.code,
            "name": course.name,
            "instructor": course.instructor,
            "link": course.link,
            "class_count": course.class_count,
            "enroll_num": course.enroll_num,
            "class_type": course.class_type
        }
        for course in course_objects
    ]

    return jsonify({"data": data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)