import Rebase from 're-base'
import firebase from 'firebase/app'
import database from 'firebase/database'
import config from '../arenatv_secrets/firebaseSecrets'

const app = firebase.initializeApp(config)

const db = database(app)
const base = Rebase.createClass(db)

export default base
