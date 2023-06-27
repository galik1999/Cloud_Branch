import backend
import firebase_admin
from flask_ngrok import run_with_ngrok
from flask import Flask, jsonify, render_template, url_for, request, redirect, abort, make_response, session
from pyngrok import ngrok
from time import gmtime, strftime
from firebase_admin import credentials
from firebase_admin import db

app = Flask(__name__)
run_with_ngrok(app)
app.secret_key = 'your_secret_key'

try:
    firebase_admin.get_app()
except ValueError as e:
    cred = credentials.Certificate("serviceAccount.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://cloudclass-44ac5-default-rtdb.europe-west1.firebasedatabase.app'
    })
    
DBConnection = backend.Database('https://cloudclass-44ac5-default-rtdb.europe-west1.firebasedatabase.app/')



@app.route('/')
def index():
  r = make_response(render_template('index.html'))
  r.headers.set( "ngrok-skip-browser-warning", "69420")
  return r

@app.route('/<nickname>')
def home(nickname):
  db_users = DBConnection.get_data("Users")
  user = session.get('user')
  if user is not None and nickname == user['nickname']:
      return redirect(url_for('myProfile'))

  for keys in db_users:
    if(db_users[keys]['nickname'] == nickname):
        return render_template('MyProfile.html', highscore=db_users[keys]['highscore'], nickname=db_users[keys]['nickname'], username=db_users[keys]['username'])
  return abort(404)

   
@app.route('/play/<game>')
def play_game(game):
    user = session.get('user')
    if user is None:
       return redirect(url_for('index'))
    db_questions = DBConnection.get_data("questions")
    #db_question_list = [db_questions[key] for key in db_questions.keys()]
    if(game == "trivia"):
      return render_template('playtrivia.html', question_list= db_questions)

@app.route('/play/<game>', methods=["POST"])
def game_end(game):
  recordBroken = "False"
  user = session.get('user')
  game_details = request.json
  session["user_statistics"] = {
    "score" : game_details["score"],
    "answers": game_details["answers"],
    "array": game_details["arrayscores"],
    "recordBroken": recordBroken
  }
  if user is not None:
    data = DBConnection.get_data('Users')
    foundUser = [key for key in data if data[key]["username"] == user["username"]]
    if int(user['highscore']) < game_details["score"]:
       user['highscore'] = str(game_details["score"])
       recordBroken = "True"
       if len(foundUser) > 0:
          DBConnection.update_data("Users", foundUser[0], user)
    SaveGame(foundUser[0]) 
  redirect_to_main = {"url":url_for('game_current_statistics')}
  return jsonify(redirect_to_main)

@app.route('/statistics')
def game_current_statistics():
    user_statistics = session.get('user_statistics')
    user = session.get('user')
    db_users = DBConnection.get_data("Users")
    foundUser = [key for key in db_users.keys() if db_users[key]['username']==user['username']]
    db_games = DBConnection.get_data("Games")
    arraygames = []
    if foundUser[0] in db_games.keys():
        for games in db_games[foundUser[0]]:

          game_time = db_games[foundUser[0]][games]['game-info']['time']
          game_score = db_games[foundUser[0]][games]['game-info']['score']
          game_dict = {
             "time": game_time,
             "score": game_score
          }
          arraygames.append(game_dict)
        arraygames = sorted(arraygames, key=lambda t: t["time"]) 
    
    return render_template('gameStatistics.html',all_games=arraygames, right_anwser=user_statistics['answers'], array_anwser=user_statistics['array'])

@app.route('/statistics/<id>')
def game_statsitics(id):
  user = session.get('user')
  db_users = DBConnection.get_data("Users")
  foundUser = [key for key in db_users.keys() if db_users[key]['username']==user['username']]
  db_games = DBConnection.get_data("Games")
  if id in db_games[foundUser[0]]:
    game_info = db_games[foundUser[0]][id]['game-info']
    arraygames = []
    for games in db_games[foundUser[0]]:

      game_time = db_games[foundUser[0]][games]['game-info']['time']
      game_score = db_games[foundUser[0]][games]['game-info']['score']
      game_dict = {
         "time": game_time,
         "score": game_score
      }
      arraygames.append(game_dict)
    arraygames = sorted(arraygames, key=lambda t: t["time"]) 
    return render_template('gameStatistics.html',all_games=arraygames, date=game_info['time'], right_anwser=game_info['right_anwsers'], array_anwser=game_info['array_anwsers'])
  return redirect(url_for('index'))

@app.route('/register')
def register():
  return render_template('register.html')

@app.route('/profile')
def myProfile():
  user = session.get('user')
  db_users = DBConnection.get_data("Users")
  foundUser = [key for key in db_users.keys() if db_users[key]['username']==user['username']]
  db_games = DBConnection.get_data("Games")
  if foundUser[0] in db_games:
    return render_template('MyProfile.html', highscore=user['highscore'], nickname=user['nickname'], username=user['username'], game_info = db_games[foundUser[0]])
  return render_template('MyProfile.html', highscore=user['highscore'], nickname=user['nickname'], username=user['username'], game_info=None)

@app.route('/profile', methods=["POST"])
def profileChanges():
    db_users = DBConnection.get_data("Users")
    user = session.get('user')
    userRef = None

    username = request.form.get('username')
    password = request.form.get('password')
    new_nickname = request.form.get('nickname')

    for client in db_users:
      if(db_users[client]["username"] == user["username"]):
        userRef = client
        break
    # Check if the new username is unique
    if username != user['username']:
        for client in db_users.values():
            if client['username'] == username:
                # flash('Username is already taken.')
                return redirect(url_for('myProfile', name=client["nickname"]))
    
    # Check if the new nickname is unique
    if new_nickname != user['nickname']:
        for client in db_users.values():
            if client['nickname'] == new_nickname:
                # flash('Nickname is already taken.')
                return redirect(url_for('myProfile', name=client["nickname"]))

    # Update the user's information
    if username is not None:
      user['username'] = username
    if password is not None and len(password) > 0:
      user['password'] = password
    if new_nickname is not None:
      user['nickname'] = new_nickname

    session['user'] = user

    # Save the updated user data to the database
    DBConnection.update_data("Users", userRef, user)

    # flash('Profile updated successfully.')
    return redirect(url_for('myProfile', name=new_nickname))

def score(element):
  return int(element["highscore"])

@app.route('/leaderboard')
def leaderboard():
  db_users = DBConnection.get_data("Users")
  db_list_users = [db_users[key] for key in db_users.keys()]
  db_list_users.sort(key=score, reverse=True)
  return render_template('leaderboard.html', db_list_users=db_list_users)

@app.route('/about')
def about():
  return render_template('AboutUs.html')

@app.route('/logout')
def logout():
  session.clear()
  return redirect(url_for('index'))

@app.route('/login')
def login():
  return render_template('login.html',flag=True)

@app.route('/login',methods=["POST"])
def loginAction(flag=True):
  db_users = DBConnection.get_data("Users")
  username = request.form.get('username')
  password = request.form.get('password')

  userData = {}
  for user in db_users.values():
    userData[user['username']] = user['password']
  

  if(username not in userData.keys()):
    return render_template('login.html',flag=False)
  if(password not in userData.values()):
    return render_template('login.html',flag=False)
  if(userData[username] == password):
    # TODO: LOG IN
    for user in db_users:
      if(db_users[user]["username"] == username):
        session['user'] = db_users[user]
        break
    
    return redirect(url_for('index'))

  return render_template('login.html',flag=False)

@app.route('/register', methods=["POST"])
def registerpost():
  username = request.form.get('username')
  db_users = DBConnection.get_data("Users")
  is_duplicate = [key for key in db_users.keys() if db_users[key]["username"]==username]
  duplicated_users = list(is_duplicate)
  if(len(duplicated_users)):
    return abort(403)
  
  password = request.form.get('password')
  nickname = request.form.get('nickname')
  user_id = request.form.get('id')
  new_user = {
      "highscore":"0",
      "id":user_id,
      "nickname":nickname,
      "username":username,
      "password":password,
      "role": "player"
      }
  session['user'] = new_user
  DBConnection.post_data("Users",new_user)
  return redirect(url_for('home', nickname=nickname))


@app.route('/manager')
def manager():
  if 'user' in session:
    if session['user']['role'] == 'admin':
      return render_template('manager.html')
  return redirect(url_for('index'))

@app.route('/manager/<qID>')
def getQuestion(qID):
  if 'user' not in session:
     return redirect(url_for('index'))
  if session['user']['role'] != 'admin':
     return redirect(url_for('index'))
  qArr = DBConnection.get_data("questions")
  qNumber = int(qID)
  #print(qArr)
  print(qArr[qNumber])
  return render_template('question.html',qArr=qArr[qNumber])

@app.route('/manager/<qID>',methods=['POST'])
def operations(qID):
  if 'user' not in session:
     return redirect(url_for('index'))
  if session['user']['role'] != 'admin':
     return redirect(url_for('index'))
  if request.method == 'POST':
    if(request.form.get('delete') == 'Delete Question'):
      DBConnection.delete_data('questions',qID)
    elif(request.form.get('update') == 'Update Question'):
      print(request.form.get('update'))
      qArr = DBConnection.get_data('questions')
      key = len(qArr)
      # CRUD CREATE OPERATION
      description = request.form.get('desc')
      option1 = request.form.get('opt1')
      option2 = request.form.get('opt2')
      option3 = request.form.get('opt3')
      option4 = request.form.get('opt4')
      answer = request.form.get('corr')
      difficulty = request.form.get('diff')
      
      newQuestion = {
          'question': description,
          'option1': option1, 
          'option2': option2,
          'option3': option3,
          'option4': option4,
          'correct': answer,
          'questionlevel': difficulty    
      }
      DBConnection.update_data('questions',str(qID),newQuestion)
  return redirect(url_for('manager'))


@app.route('/manager/allQuestions')
def allQuestions():
  if 'user' not in session:
     return redirect(url_for('index'))
  if session['user']['role'] != 'admin':
     return redirect(url_for('index'))
  return render_template('allQuestions.html')

@app.route('/manager/addQuestion')
def addQuestion():
  if 'user' not in session:
     return redirect(url_for('index'))
  if session['user']['role'] != 'admin':
     return redirect(url_for('index'))  
  return render_template('addQuestion.html')


@app.route('/manager/addQuestion',methods = ['POST'])
def postQuestion():
  if 'user' not in session:
     return redirect(url_for('index'))
  if session['user']['role'] != 'admin':
     return redirect(url_for('index'))  
  qArr = DBConnection.get_data('questions')
  key = len(qArr)
  # CRUD CREATE OPERATION
  description = request.form.get('desc')
  option1 = request.form.get('opt1')
  option2 = request.form.get('opt2')
  option3 = request.form.get('opt3')
  option4 = request.form.get('opt4')
  answer = request.form.get('corr')
  difficulty = request.form.get('diff')
  
  newQuestion = {
      'question': description,
      'option1': option1, 
      'option2': option2,
      'option3': option3,
      'option4': option4,
      'correct': answer,
      'questionlevel': difficulty    
  }
  DBConnection.update_data("questions",str(key),newQuestion)
  return redirect(url_for('manager'))

def SaveGame(id_reference):
  ref = db.reference('Games')
  box_ref = ref.child(id_reference)  
  box_ref.push({
          'game-info': {
            'time' : strftime("%Y-%m-%d %H:%M:%S", gmtime()),
            'score' : session["user_statistics"]['score'],
            'right_anwsers' : session["user_statistics"]['answers'],
            'array_anwsers' : session["user_statistics"]['array']
          }  
    })
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
if __name__ == '__main__':
    app.run()