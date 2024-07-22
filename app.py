from flask import Flask, request, jsonify, render_template, send_file
from summa import summarizer
from PIL import Image, ImageDraw, ImageFont
import io
import nltk
import random

nltk.download('punkt')

app = Flask(__name__)

def summarize_chapter(chapter_text, ratio=0.2):
    summary = summarizer.summarize(chapter_text, ratio=ratio)
    summary_bullet_points = summary.split('\n')
    return summary_bullet_points

def generate_quiz(text, num_questions=5):
    sentences = nltk.sent_tokenize(text)
    random.shuffle(sentences)
    questions = sentences[:num_questions]
    quiz = []
    answers = []
    for question in questions:
        question_text = question + " (yes/no)"
        quiz.append(question_text)
        answers.append(random.choice(["yes", "no"]))
    return quiz, answers

def evaluate_answers(user_answers, correct_answers):
    score = 0
    total_questions = len(correct_answers)
    for user_answer, correct_answer in zip(user_answers, correct_answers):
        if user_answer.lower() == correct_answer.lower():
            score += 1
    return score, total_questions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    chapter_text = request.form['chapter_text']
    ratio = float(request.form.get('ratio', 0.2))
    summary = summarize_chapter(chapter_text, ratio)
    return jsonify(summary)

@app.route('/generate_image', methods=['POST'])
def generate_image():
    data = request.get_json()
    summary_text = data['summary']
    img = Image.new('RGB', (800, 600), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    d.text((10, 10), summary_text, font=font, fill=(0, 0, 0))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return send_file(buffer, mimetype='image/png')

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz_route():
    text = request.form['text']
    quiz, answers = generate_quiz(text)
    return jsonify({'quiz': quiz, 'answers': answers})

@app.route('/evaluate_quiz', methods=['POST'])
def evaluate_quiz():
    data = request.get_json()
    user_answers = data['user_answers']
    correct_answers = data['quiz_answers']
    score, total_questions = evaluate_answers(user_answers, correct_answers)
    return jsonify({'score': score, 'total_questions': total_questions})

if __name__ == '__main__':
    app.run(debug=True)
