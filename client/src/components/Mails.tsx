import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
  Segment,
  Modal,
  Form,
  TextArea
} from 'semantic-ui-react'

import { createMailItem, deleteMailItem, getAllMail, searchItems, uploadFile } from '../api/todos-api'
import Auth from '../auth/Auth'
import { MailItem } from '../types/Mail'

interface MailsProps {
  auth: Auth
  history: History
}

interface MailCreate {
  title: string
  content: string
  sendDate: string
  mailReceive: string
  sendWithAttachment: boolean
  file?: any
}

interface MailsState {
  mails: MailItem[]
  loadingMails: boolean
  showModal: boolean
  searchKey: string
  mailCreate: MailCreate
}

export class Mails extends React.PureComponent<MailsProps, MailsState> {
  state: MailsState = {
    mails: [],
    loadingMails: true,
    showModal: false,
    searchKey: "",
    mailCreate: {
      content: "",
      mailReceive: "",
      sendDate: "2022-10-30T12:30:30",
      sendWithAttachment: false,
      title: ""
    }
  }


  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/mails/${itemId}/edit`)
  }

  async componentDidMount() {
    try {
      const mails = await getAllMail(this.props.auth.getIdToken())
      this.setState({
        mails,
        loadingMails: false
      })
    } catch (e) {
      alert(`Failed to fetch mails: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Mail-Send a message for the future</Header>

        {this.renderCreateTodoInput()}
        {this.renderModalCreate()}

        <Grid>
          <Grid.Row>
            <Grid.Column width={15}>
              <Form>
                <Form.Field>
                  <input placeholder='search....' onChange={(e) => {
                    this.setState({
                      mails: this.state.mails,
                      loadingMails: this.state.loadingMails,
                      searchKey: e.target.value,
                      showModal: false
                    })
                  }} value={this.state.searchKey}></input>
                </Form.Field>
              </Form>
            </Grid.Column>
            <Grid.Column width={1}>
              <button type='button' onClick={async () => {
                this.setState({
                  mails:this.state.mails,
                  loadingMails: true,
                  searchKey: this.state.searchKey,
                  showModal: false
                })
                console.log(`Search`)
                const mails = await searchItems(this.props.auth.getIdToken(), this.state.searchKey)
                this.setState({
                  mails,
                  loadingMails: false,
                  searchKey: this.state.searchKey,
                  showModal: false
                })
              }}>Search</button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        {this.renderTodos()}
      </div>
    )
  }


  submitCreateItem = async () => {
    try {
      const val = await createMailItem(this.props.auth.getIdToken(), {
        content: this.state.mailCreate.content,
        mailDestination: this.state.mailCreate.mailReceive,
        sendDate: this.state.mailCreate.sendDate + "Z",
        title: this.state.mailCreate.title,
        sendWithAttachment: this.state.mailCreate.sendWithAttachment
      })

      if (this.state.mailCreate.sendWithAttachment && val.presignedUrl && this.state.mailCreate.file) {
        console.log("Start upload file")
        await uploadFile(val.presignedUrl, this.state.mailCreate.file)
        console.log("Upload image sucess")
      }

      this.setState({
        mails: [...this.state.mails, val],
        loadingMails: this.state.loadingMails,
        searchKey: this.state.searchKey,
        showModal: false,
        mailCreate: {
          content: "",
          mailReceive: "",
          sendDate: "",
          sendWithAttachment: false,
          title: ""
        }
      })
      console.log("Create item success")
    } catch (err) {
      alert(`Create new item failed : ${err}`)
    }
  }

  renderModalCreate() {
    return (
      <Modal
        onClose={() => this.setState({
          mails: this.state.mails,
          loadingMails: this.state.loadingMails,
          searchKey: this.state.searchKey,
          showModal: false
        })}
        onOpen={() => this.setState({
          mails: this.state.mails,
          loadingMails: this.state.loadingMails,
          searchKey: this.state.searchKey,
          showModal: true
        })}
        open={this.state.showModal}
      >
        <Modal.Header>Create new Mail Item</Modal.Header>
        <Modal.Content>
          <Form onSubmit={() => this.submitCreateItem()}>
            <Form.Field>
              <label>Title</label>
              <input placeholder='Title' value={this.state.mailCreate.title}
                onChange={(e) => {
                  this.setState({
                    mails: this.state.mails,
                    loadingMails: this.state.loadingMails,
                    searchKey: this.state.searchKey,
                    showModal: this.state.showModal,
                    mailCreate: {
                      content: this.state.mailCreate.content,
                      mailReceive: this.state.mailCreate.mailReceive,
                      sendDate: this.state.mailCreate.sendDate,
                      sendWithAttachment: this.state.mailCreate.sendWithAttachment,
                      title: e.target.value
                    }
                  })
                }}
              />
            </Form.Field>
            <Form.Field>
              <label>To Email</label>
              <input placeholder='Choose destination email...' value={this.state.mailCreate.mailReceive}
                onChange={(e) => {
                  this.setState({
                    mails: this.state.mails,
                    loadingMails: this.state.loadingMails,
                    searchKey: this.state.searchKey,
                    showModal: this.state.showModal,
                    mailCreate: {
                      content: this.state.mailCreate.content,
                      mailReceive: e.target.value,
                      sendDate: this.state.mailCreate.sendDate,
                      sendWithAttachment: this.state.mailCreate.sendWithAttachment,
                      title: this.state.mailCreate.title
                    }
                  })
                }} />
            </Form.Field>
            <Form.Field>
              <label> Message</label>
              <TextArea placeholder='Message for the future' value={this.state.mailCreate.content}
                onChange={(e) => {
                  this.setState({
                    mails: this.state.mails,
                    loadingMails: this.state.loadingMails,
                    searchKey: this.state.searchKey,
                    showModal: this.state.showModal,
                    mailCreate: {
                      content: e.target.value,
                      mailReceive: this.state.mailCreate.mailReceive,
                      sendDate: this.state.mailCreate.sendDate,
                      sendWithAttachment: this.state.mailCreate.sendWithAttachment,
                      title: this.state.mailCreate.title
                    }
                  })
                }} />
            </Form.Field>
            <Form.Field>
              <label>Date and Time expected</label>
              <input placeholder='yyyy-MM-ddThh:mm:ss' defaultValue={"2022-10-30T12:30:30"} value={this.state.mailCreate.sendDate}
                onChange={(e) => {
                  this.setState({
                    mails: this.state.mails,
                    loadingMails: this.state.loadingMails,
                    searchKey: this.state.searchKey,
                    showModal: this.state.showModal,
                    mailCreate: {
                      content: this.state.mailCreate.content,
                      mailReceive: this.state.mailCreate.mailReceive,
                      sendDate: e.target.value,
                      sendWithAttachment: this.state.mailCreate.sendWithAttachment,
                      title: this.state.mailCreate.title
                    }
                  })
                }} />
            </Form.Field>
            <Form.Field>
              <input
                type="file"
                accept="image/*"
                placeholder="Image to upload"
                onChange={(e) => {
                  const files = e.target.files
                  if (!files) return
                  this.setState({
                    mails: this.state.mails,
                    loadingMails: this.state.loadingMails,
                    searchKey: this.state.searchKey,
                    showModal: this.state.showModal,
                    mailCreate: {
                      content: this.state.mailCreate.content,
                      mailReceive: this.state.mailCreate.mailReceive,
                      sendDate: this.state.mailCreate.sendDate,
                      sendWithAttachment: true,
                      title: this.state.mailCreate.title,
                      file: files[0]
                    }
                  })
                }}
              />
            </Form.Field>
            <Form.Button content='Submit' positive icon='checkmark' />
            <span>*Note 1: When you put the new email, please help me verify it (aws will send you an email). Because this account is under SandBox. More infomation <a href='https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html'>SandBox</a></span>
            <br />
            <span>*Note 2: Mail will be send for 5 minutes late</span>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Button primary icon='add' onClick={() => {
            this.setState({
              mails: this.state.mails,
              loadingMails: this.state.loadingMails,
              searchKey: this.state.searchKey,
              showModal: true
            })
          }}>Add new mail message here !</Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingMails) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        <Grid.Row divided>

          <Grid.Column width={4} verticalAlign="middle">
            <strong>Title</strong>
          </Grid.Column>
          <Grid.Column width={9} floated="right">
            Content
          </Grid.Column>
          <Grid.Column width={2} floated="right">
            Action
          </Grid.Column>
        </Grid.Row>
        <Divider section />
        {this.state.mails.map((mail, pos) => {
          return (
            <>
              <Grid.Row key={mail.itemId} divided>

                <Grid.Column width={4} verticalAlign="middle">
                  <strong>{mail.title}</strong>
                  <br />
                  To : {mail.mailDestination}
                  <br />
                  Date expected : {mail.sendDate.replaceAll("Z", "")}
                </Grid.Column>
                <Grid.Column width={9} floated="right">
                  {mail.content}
                </Grid.Column>
                <Grid.Column width={2} floated="right">
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(mail.itemId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                  <Button
                    icon
                    color="red"
                    onClick={async () => {
                      try {
                        await deleteMailItem(this.props.auth.getIdToken(), mail.itemId)
                        this.setState({
                          mails: this.state.mails.filter(item => item.itemId !== mail.itemId),
                          loadingMails: this.state.loadingMails,
                          searchKey: this.state.searchKey,
                          showModal: false,
                          mailCreate: {
                            content: "",
                            mailReceive: "",
                            sendDate: "",
                            sendWithAttachment: false,
                            title: ""
                          }
                        })
                        console.log("delete success")
                      } catch (err) {
                        alert(`Mail item deletion failed: ${err}`)
                      }
                    }}
                  >
                    <Icon name="delete" />
                  </Button>
                </Grid.Column>
                {this.showAttachment(mail.sendWithAttachment, mail.attachmentUrl)}
              </Grid.Row>
              <Divider section />
            </>
          )
        })}
      </Grid>
    )
  }

  showAttachment(attachment: boolean, attachmentUrl: string) {
    if (!attachment || !attachmentUrl) {
      return <></>
    }
    return <Segment>
      Attachment: <Image src={attachmentUrl} size="small" wrapped />
    </Segment>
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
