import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './routes/PrivateRoute'
import './css/App.css';
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import UpdateProfile from './pages/UpdateProfile'
import Success from './pages/Success';
import Verificar from './pages/Verificar';
import TwoFactorAuth from './pages/2FA'


function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Switch>
            <Route exact path='/' component={Home} />
            <PrivateRoute path='/dashboard' component={Dashboard} />
            <PrivateRoute path='/update-profile' component={UpdateProfile} />
            <Route path='/signup' component={Signup} />
            <Route path='/login' component={Login} />
            <Route path='/2FA' component={TwoFactorAuth}/>
            <Route path='/forgot-password' component={ForgotPassword} />
            <Route path='/success-password' component={Success} />
            <Route path='/verificar-correo' component={Verificar} />
          </Switch>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
