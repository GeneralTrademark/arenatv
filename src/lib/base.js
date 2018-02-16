import Rebase from 're-base'
import firebase from 'firebase'
import { database } from 'firebase'

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_APP,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_CODE,
}

const app = firebase.initializeApp(config)
const db = database(app)
const base = Rebase.createClass(db)

export default base
