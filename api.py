from flask import Flask, jsonify, request
from class_data.ucsc_courses import get_courses
from course import Course  # Import the Course class

app = Flask(__name__)

@app.route('/api/courses', methods=['GET'])
def get_courses_data():
    course_filter = request.args.get('course', 'AnyGE')  # Get course filter from query parameters

    # Get list of Course objects from get_courses
    course_objects = get_courses(course_filter)

    # Organize data into a list of dictionaries
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