import classnames from 'classnames';
import { Aside, Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { HandsUpContainer } from '~containers/hand-up';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box';
import { SceneSwitch } from '~containers/scene-switch';
import { RoomMidStreamsContainer } from '~containers/stream/room-mid-player';
import { ToastContainer } from '~containers/toast';
import { Award } from '../../containers/award';
import Room from '../room';
import { Float } from '~ui-kit';
import { RemoteControlContainer } from '../../containers/remote-control';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Whiteboard } from '../../containers/widget/slots';
import { StreamWindowsContainer } from '../../containers/stream-windows-container';
import { EduClassroomConfig, EduRoleTypeEnum, LeaveReason } from 'agora-edu-core';
import { useStore } from '@/infra/hooks/ui-store';
import { DialogCategory } from '@/infra/stores/common/share-ui';

export const MidClassScenario = () => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');
  const { classroomStore } = useStore();
  window.onbeforeunload = function () {
    classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
  };
  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            <NavigationBar />
            <Layout className="flex-grow items-stretch fcr-room-bg h-full">
              <Layout
                className="flex-grow items-stretch relative"
                direction="col"
                style={{ paddingTop: 2 }}>
                <Whiteboard />
                <ScreenShareContainer />
                <WhiteboardToolbar />
                <ScenesController />
                <Float bottom={15} right={10} align="end" gap={2}>
                  <HandsUpContainer />
                </Float>
                <StreamWindowsContainer />
              </Layout>
              <Aside>
                <RoomMidStreamsContainer />
              </Aside>
              <RemoteControlContainer />
            </Layout>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <WidgetContainer />
          <ToastContainer />
          <Award />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};
