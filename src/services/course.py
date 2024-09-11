class Course:
    def __init__(self, code, name, instructor, link, class_count, enroll_num,class_type):
        self.code=code
        self.name = name
        self.instructor = instructor
        self.link = link
        self.class_count = class_count
        self.enroll_num = enroll_num
        self.class_type = class_type

    

    def __repr__(self):
        return f"Course(code={self.code}, name={self.name}, instructors={self.instructor}, link={self.link}, class_count={self.class_count}, enroll_num={self.enroll_num}, class_type={self.class_type})"