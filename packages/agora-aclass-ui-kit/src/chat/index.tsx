import { Box } from '@material-ui/core'
import React, { useEffect, useRef, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { Bubble } from './bubble'
import { WithIconButton } from './control/button'
import forbiddenSpeech from './assets/forbiddenSpeech.png'
import chat from './assets/chat.png'
import TelegramIcon from '@material-ui/icons/Telegram';

export type ChatMessage = {
  id: string,
  userName: string,
  sendTime: string,
  messagesId: number | string,
  showTranslate: boolean,
  chatText: string,
  isSender: boolean,
  onClickTranslate: (evt: any) => any,
  onClickFailButton?: (evt?: any) => any,
  translateText?: string,
  status: 'loading' | 'fail' | 'success'
}

export type ChatMessageList = ChatMessage[]
export interface ChatBoardProps {
  bannedText: string,
  messages: ChatMessageList,
  historyMessage?: ChatMessageList,
  panelBackColor?: string,
  panelBorderColor?: string,
  borderWidth?: number,
  maxHeight?: number | string,
  minHeight?: number | string,
  onPullFresh?: () => any,
  placeholder?: string,
  toolView?: string | React.ReactNode,
  sendButtonBackColor?: string,
  onInputText?: (args?: any) => any,
  sendView?: string | React.ReactNode,
  titleView?: string | React.ReactNode,
  onClickSendButton?: (message?: string) => any,
  onClickBannedButton?: () => any,
  onClickMinimize?: () => any,
  failText?:string,
  sendButtonText?:string,
  loadingText?:string,
  titleText?:string,
  isDisableSendButton:boolean
}


let currentHeight = 0;
export const ChatBoard = (props: ChatBoardProps) => {
  const {
    panelBackColor = "#DEF4FF",
    panelBorderColor = '#75C0FF',
    messages,
    bannedText,
    borderWidth = 15,
    maxHeight,
    onPullFresh,
    toolView,
    sendButtonBackColor = '#E9BE36',
    onInputText,
    sendView,
    onClickSendButton,
    onClickBannedButton,
    titleView,
    minHeight,
    titleText,
    sendButtonText,
    loadingText,
    failText,
    onClickMinimize = () => { }
  } = props
  const bottomDistance = borderWidth
  const useStyles = makeStyles((theme: Theme) => ({
    chatScroll: {
      position: 'absolute',
      top: 0,
      right: '0px',
      left:'0px',
      height: '100%',
      width: '100%',
      padding:'5px',
      boxSizing:'border-box'
    },
    chatContent: {
      background: panelBackColor,
      borderColor: panelBorderColor,
      borderStyle: 'solid',
      overflowY: 'scroll',
      flex: 1,
      // maxHeight: maxHeight || '200px',
      minHeight: minHeight || '50px',
      borderWidth: '0px',
      padding: '10px',
      borderRadius: '10px 10px 0 0 ',
      boxShadow: `0px 0px 0px 1px ${panelBorderColor}`,
      position: 'relative',
    },
    title: {
      color: '#fff',
      background: panelBorderColor,
      textAlign: 'center',
      width: '100%',
      minHeight: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyItems: 'center',
      justifyContent: 'center'
    },
    chat: {
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      //boxShadow: `0px 0px 0px ${borderWidth}px ${panelBorderColor}`,
      background: panelBorderColor,
      borderWidth: '0px 10px 10px',
      borderStyle: 'solid',
      borderColor: panelBorderColor,
    },
    chatTool: {
      display: 'flex',
      flexWrap: 'nowrap',
      justifyItems: 'center',
      minHeight: '30px',
      flexDirection: 'row-reverse'
    },
    input: {
      position: 'relative',
      background: "#fff",
      borderRadius: '0 0 10px 10px',
      padding: '10px 10px',
    },
    chatTextArea: {
      resize: 'none',
      width: '100%',
      border: 'none',
      boxSizing: 'border-box',
      outline:'none',
      minHeight: '21px',
    },
    toolButton: {
      display: 'flex',
      color: '#4992CF',
      flexWrap: 'nowrap',
      alignItems: 'center',
      marginRight:'14px',
      cursor:'pointer',
      fontSize:'14px'
    },
    sendButton: {
      cursor: 'pointer',
      background: sendButtonBackColor,
      borderRadius: '13px',
      color: '#fff',
      minWidth: '70px',
      display: 'flex',
      justifyContent: 'center',
      height: '26px',
      position: 'absolute',
      bottom: '3px',
      alignItems: 'center',
      right: '6px',
      fontSize:'14px',
      '&::after': {
        background: 'rgba(185,141,0,.4)'
      }
    },
    disableSendButton: {
      background: '#e9be3685'
    },
    sendContent: {
      display: 'flex',
      height:'26px',
      width: '100%',
      flexDirection: 'row-reverse',
    },
    TelegramIcon: {
      color: '#fff',
      marginRight: '5px',
      width: '16px'
    },
    minimize: {
      width: '24px',
      height: '24px',
      background: '#fff3',
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    strip: {
      width: '16px',
      height: '3px',
      background: '#FFFFFF',
      borderRadius: '2px',
    },
    titleView: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    }
  }))
  const classes = useStyles()
  const [inputMessages, setInputMessages] = useState('')
  const [isSendButton, setIsSendButton] = useState(false)
  const chatRef = useRef<any>()
  const ToolButton = (props: { onClickBannedButton: any, bannedText: string }) => {
    return (
      <div className={classes.toolButton} onClick={props.onClickBannedButton}>
        <WithIconButton
          iconStyle={{ width: '20px', height: '20px', marginRight: '5px' }}
          icon={forbiddenSpeech} />
          {props.bannedText}
      </div>)
  }
  const scrollEvent = (event: any) => {
    const { target } = event;
    if (target?.scrollTop === 0) {
      currentHeight = target.scrollHeight
      onPullFresh && onPullFresh()
    }
  }
  const handleChangeText = (event: any) => {
    const { value } = event.target;
    setInputMessages(value.trim());
    onInputText && onInputText(event);
  }
  const handleKeyDown=(event:any)=>{
    if(event.keyCode===13){
      handlerSendButton()
    }
  }
  useEffect(() => {
    const position = isSendButton ? chatRef?.current.scrollHeight : chatRef?.current.scrollHeight - currentHeight
    chatRef?.current.scrollTo(0, position)
  }, [messages])
  const handlerSendButton = () => {
    setIsSendButton(true)
    onClickSendButton && onClickSendButton(inputMessages.trim())
    setInputMessages("")
  }
  return (
    <Box className={classes.chat}>
      {titleView ||
        <div className={classes.titleView}>
          <div className={classes.title}><WithIconButton icon={chat} iconStyle={{ width: '22px', height: '22px', marginRight: '6px' }} />{props.titleText || 'chat'}</div>
          <div className={classes.minimize} onClick={onClickMinimize}><span className={classes.strip} /></div>
        </div>}
      <div className={classes.chatContent} onScroll={(event) => scrollEvent(event)} ref={chatRef}>
        <div className={classes.chatScroll}>
          {messages?.map((item, index) => {
            return <Bubble
              {...item}
              content={item.chatText}
              time={item.sendTime}
              isSender={item.isSender}
              canTranslate={item.showTranslate || true}
              key={`${item.userName}_${index}`}
              onClickTranslate={item.onClickTranslate}
              onClickFailButton={item.onClickFailButton ?item.onClickFailButton : () => {}}
              translateText={item.translateText}
              status={item.status || 'success'}
              loadingText ={loadingText}
              failText={failText}
            />
          })}
        </div>
      </div>
      <div className={classes.chatTool}>{toolView || <ToolButton onClickBannedButton={onClickBannedButton} bannedText={bannedText} />}</div>
      <div className={classes.input}>
        <textarea
          onKeyDown={(e) => { handleKeyDown(e) }}
          onChange={(e) => { !props.isDisableSendButton && handleChangeText(e) }}
          className={classes.chatTextArea}
          value={inputMessages}
          placeholder={props.placeholder || 'Press enter to send a message'}
          name="chatTextArea" id="chatTextArea" cols={30} rows={4} />
        <div className={classes.sendContent}>
          {sendView || <div onClick={handlerSendButton} className={`${classes.sendButton} ${props.isDisableSendButton ? classes.disableSendButton :null}`}><TelegramIcon className={classes.TelegramIcon} />{sendButtonText}</div>}
        </div>
      </div>
    </Box>
  )
}

export { Bubble } from './bubble'