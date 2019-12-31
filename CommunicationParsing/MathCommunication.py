"""
Parses information about which communication courses must be taken in a degree's requirements.

Contributors:
Calder Lund
"""

import re
from bs4 import BeautifulSoup


class Communications:
    def __init__(self):
        self.__list1 = []
        self.__list2 = []

    def load_file(self, file):
        html = open(file, encoding="ISO-8859-1")
        self.data = BeautifulSoup(html, 'html.parser')
        ul = self.data.find_all("ul")
        list_num = 0

        for u in ul:
            courses = u.find_all("a", href=re.compile("courses"))
            if len(courses):
                list_num += 1
            for course in courses:
                if list_num == 1:
                    self.__list1.append(course.text)
                if list_num == 2:
                    self.__list2.append(course.text)

    def is_in_list1(self, course_code):
        return course_code in self.__list1

    def is_in_list2(self, course_code):
        return course_code in self.__list2 or self.is_in_list1(course_code)

    def __str__(self):
        output = "List 1:\n"
        for course in self.__list1:
            output += "- " + course + "\n"

        output += "List 2:\n"
        for course in self.__list2:
            output += "- " + course + "\n"

        return output


if __name__ == "__main__":
    com = Communications()
    com.load_file("MathReq.html")

    courses = ["MATH 235", "EMLS 102R", "ENGL 108B"]
    for course in courses:
        print(course)
        print("In List 1:", com.is_in_list1(course))
        print("In List 2:", com.is_in_list2(course))
        print()
