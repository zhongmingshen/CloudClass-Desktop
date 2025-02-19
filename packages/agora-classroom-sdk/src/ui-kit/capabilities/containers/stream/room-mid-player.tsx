import { observer } from 'mobx-react';
import { useInteractiveUIStores, useStore } from '@/infra/hooks/ui-store';
import { useCallback, useEffect, useState } from 'react';
import { EduInteractiveUIClassStore } from '@/infra/stores/interactive';
import { CarouselGroup, NavGroup } from '.';
import { visibilityControl } from '../visibility';
import { studentVideoEnabled, teacherVideoEnabled } from '../visibility/controlled';
import { DragableStream } from './draggable-stream';
import { EduClassroomConfig, EduRoleTypeEnum, LeaveReason } from 'agora-edu-core';
import { DialogCategory } from '@/infra/stores/common/share-ui';

export const RoomMidStreamsContainer = observer(() => {
  const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;

  const { stageVisible } = streamUIStore;
  const { teacherCameraStream } = streamUIStore;
  const { streamWindowUIStore } = useStore();
  const { visibleStream } = streamWindowUIStore;
  return (
    <div
      id="stage-container"
      className={`w-full flex-grow flex-shrink-0 ${stageVisible ? '' : 'hidden'}`}>
      <div style={{ overflow: 'hidden' }} className="h-full justify-center items-center relative">
        {!(
          teacherCameraStream?.stream.streamUuid &&
          visibleStream(teacherCameraStream?.stream.streamUuid)
        ) ? (
          <TeacherStream />
        ) : null}

        <StudentStreams />
      </div>
    </div>
  );
});

export const TeacherStream = visibilityControl(
  observer(() => {
    const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;
    const { teacherCameraStream, videoStreamSize, gap } = streamUIStore;

    const style = {
      marginRight: gap - 2,
    };

    const playerStyle = {
      width: videoStreamSize.width,
      height: videoStreamSize.height,
    };

    return <DragableStream style={style} playerStyle={playerStyle} stream={teacherCameraStream} />;
  }),
  teacherVideoEnabled,
);

export const StudentStreams = visibilityControl(
  observer(() => {
    const { streamUIStore } = useInteractiveUIStores() as EduInteractiveUIClassStore;

    const { videoStreamSize, carouselNext, carouselPrev, scrollable, gap, carouselStreams } =
      streamUIStore;

    const [navigationVisible, setNavigationVisible] = useState(false);

    const mouseHandler = useCallback(
      (visible: boolean) => () => {
        setNavigationVisible(visible);
      },
      [],
    );

    return (
      <div
        style={{ marginRight: '2px', marginTop: '1.5px' }}
        onMouseEnter={mouseHandler(true)}
        onMouseLeave={mouseHandler(false)}>
        {scrollable && (
          <NavGroup visible={navigationVisible} onPrev={carouselPrev} onNext={carouselNext} />
        )}
        <CarouselGroup
          gap={gap}
          videoWidth={videoStreamSize.width}
          videoHeight={videoStreamSize.height}
          carouselStreams={carouselStreams}
        />
      </div>
    );
  }),
  studentVideoEnabled,
);
