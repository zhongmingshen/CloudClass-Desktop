import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import { BoardPlaceHolder } from '~ui-kit';
import './index.css';
import 'video.js/dist/video-js.css';
import '@netless/window-manager/dist/style.css';
import { WhiteboardToolbar } from '~containers/toolbar';
import { useEffect } from 'react';

export const WhiteboardContainer = observer(({ children }: any) => {
  const { boardUIStore } = useStore();
  const {
    readyToMount,
    mount,
    unmount,
    rejoinWhiteboard,
    connectionLost,
    boardHeight,
    joinWhiteboardWhenConfigReady,
    leaveWhiteboard,
  } = boardUIStore;

  useEffect(() => {
    joinWhiteboardWhenConfigReady();
    return () => {
      leaveWhiteboard();
    };
  }, [leaveWhiteboard, joinWhiteboardWhenConfigReady]);

  const boardContainer = useMemo(
    () => (
      <div
        id="netless"
        ref={(dom) => {
          if (dom) {
            mount(dom);
          } else {
            unmount();
          }
        }}></div>
    ),
    [mount, unmount],
  );

  return (
    <div style={{ height: boardHeight }} className="w-full">
      {readyToMount ? (
        <div className="whiteboard-wrapper">
          {children}
          <div className="whiteboard">
            {boardContainer}
            {connectionLost ? (
              <BoardPlaceHolder
                style={{ position: 'absolute' }}
                onReconnectClick={rejoinWhiteboard}
              />
            ) : null}
            <WhiteboardToolbar />
          </div>
        </div>
      ) : null}
    </div>
  );
});
