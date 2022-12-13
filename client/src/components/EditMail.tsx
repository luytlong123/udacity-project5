import * as React from 'react'
import { Form, TextArea, Segment, Image } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getItemById, patchMailItem } from '../api/todos-api'
import { MailItem } from '../types/Mail'


interface EditMailItemProps {
  match: {
    params: {
      itemId: string
    }
  }
  auth: Auth
}

interface EditMailItemState {
  mailItem: MailItem
}

export class EditMailItem extends React.PureComponent<
  EditMailItemProps,
  EditMailItemState
> {
  state: EditMailItemState = {
    mailItem: {
      content: "",
      mailDestination: "",
      sendDate: "2022-10-30T12:30:30",
      sendWithAttachment: false,
      title: "",
      itemId: "",
      status: "",
      userId: "",
      attachmentUrl: ""
    }
  }

  async componentDidMount() {
    await this.fetchItem()
  }

  fetchItem = async () => {
    try {
      const item = await getItemById(this.props.auth.getIdToken(), this.props.match.params.itemId)
      console.log(`item : ${JSON.stringify(item)}`)
      this.setState({
        mailItem: item
      })
    } catch (err) {
      alert(`Cannot get item detail error ${err}`)
      console.log(err)
    }
  }



  render() {
    return (
      <div>
        <h1>Update Mail Item</h1>

        <Form onSubmit={async() => {
            try {
              await patchMailItem(this.props.auth.getIdToken(), this.props.match.params.itemId,{
                content:this.state.mailItem.content,
                title:this.state.mailItem.title
              })
              console.log(`Update item success`)
              alert(`Update item success!`)
            } catch (err) {
              alert(`Cannot update item error ${err}`)
              console.log(err)
            }
        }}>
          <Form.Field>
            <label>Title</label>
            <input placeholder='Title' value={this.state.mailItem.title}
              onChange={(e) => {
                this.setState({
                  mailItem: {
                    content: this.state.mailItem.content,
                    mailDestination: this.state.mailItem.mailDestination,
                    sendDate: this.state.mailItem.sendDate,
                    sendWithAttachment: this.state.mailItem.sendWithAttachment,
                    title: e.target.value,
                    itemId: this.state.mailItem.itemId,
                    status: this.state.mailItem.status,
                    userId: this.state.mailItem.userId,
                    attachmentUrl: this.state.mailItem.attachmentUrl
                  }
                })
              }}
            />
          </Form.Field>
          <Form.Field>
            <label>To Email</label>
            <input placeholder='Choose destination email...' value={this.state.mailItem.mailDestination}
              disabled />
          </Form.Field>
          <Form.Field>
            <label> Message</label>
            <TextArea placeholder='Message for the future' value={this.state.mailItem.content}
              onChange={(e) => {
                this.setState({
                  mailItem: {
                    title: this.state.mailItem.title,
                    mailDestination: this.state.mailItem.mailDestination,
                    sendDate: this.state.mailItem.sendDate,
                    sendWithAttachment: this.state.mailItem.sendWithAttachment,
                    content: e.target.value,
                    itemId: this.state.mailItem.itemId,
                    status: this.state.mailItem.status,
                    userId: this.state.mailItem.userId,
                    attachmentUrl: this.state.mailItem.attachmentUrl
                  }
                })
              }} />
          </Form.Field>
          <Form.Field>
            <label>Date and Time expected</label>
            <input placeholder='yyyy-MM-ddThh:mm:ss' defaultValue={"2022-10-30T12:30:30"} value={this.state.mailItem.sendDate}
              disabled />
          </Form.Field>
          <Form.Field>
            {this.showAttachment(this.state.mailItem.sendWithAttachment, this.state.mailItem.attachmentUrl)}
          </Form.Field>
          <Form.Field>
            <label>Status: </label>
            <input value={this.state.mailItem.status} disabled/>
          </Form.Field>

          <Form.Button content='Submit' positive icon='checkmark' />
        </Form>


      </div >
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
}
