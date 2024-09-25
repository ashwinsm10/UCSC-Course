from flask import Blueprint, jsonify, request
from app import create_app
from database_models import Course, CourseModel, CourseType, Degree

main = Blueprint('main', __name__)

@main.route('/api/last_update', methods=['GET'])
def get_last_update():
    with create_app().app_context():
        return create_app().get_last_update()

@main.route('/api/major_courses', methods=['GET'])
def get_courses_by_degree():
    degree_name = request.args.get('degree', 'Computer Science B.S.')
    with create_app().app_context():
        degree = Degree.query.filter_by(name=degree_name).first()

        if not degree:
            return jsonify({"error": "Degree not found"}), 404

        course_types = CourseType.query.filter_by(degree_id=degree.id).all()

        result = {
            "degree": degree_name,
            "course_types": []
        }

        for course_type in course_types:
            courses = Course.query.filter_by(course_type_id=course_type.id).all()
            result["course_types"].append({
                "type": course_type.name,
                "courses": [{"name": course.name} for course in courses]
            })

        return jsonify(result)

@main.route('/api/courses', methods=['GET'])
def get_courses_data():
    course_filter = request.args.get('course', 'AnyGE')
    with create_app().app_context():
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