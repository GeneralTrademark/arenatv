import Rebase from 're-base'
import firebase from 'firebase/app'
import database from 'firebase/database'

const config = {
  apiKey: process.env.REACT_APP_SECRET_CODE,
  authDomain: 'arenatv-169216.firebaseapp.com',
  databaseURL: 'https://arenatv-169216.firebaseio.com',
  projectId: 'arenatv-169216',
  storageBucket: 'arenatv-169216.appspot.com',
  messagingSenderId: process.env.REACT_APP_MESSAGING_CODE,
}

const app = firebase.initializeApp(config)

const db = database(app)
const base = Rebase.createClass(db)

export default base
