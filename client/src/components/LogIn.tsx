import * as React from 'react'
import Auth from '../auth/Auth'
import { Button, Icon } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div>
        <h1>Please log in</h1>
        <Button animated onClick={this.onLogin} size="huge" color="olive">
          <Button.Content visible>Log in</Button.Content>
          <Button.Content hidden>
            <Icon name="sign-in" />
          </Button.Content>
        </Button>
      </div>
    )
  }
}
