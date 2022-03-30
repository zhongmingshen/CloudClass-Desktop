import { AgoraRteEngine, AgoraRteEngineConfig, Logger, AgoraRteOptions } from 'agora-rte-sdk';
import { merge } from 'lodash';
import { Resource } from 'i18next';
import {
  EduSessionInfo,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  CourseWareList,
  CourseWareItem,
} from '../type';
import { CloudDriveResource } from '../stores/domain/common/cloud-drive/struct';
import { AGEduErrorCode, EduErrorCenter } from '../utils/error';
import { IAgoraWidget, IAgoraExtensionApp } from '..';

export interface WhiteboardDefaults {
  scale: number;
}
export enum Platform {
  PC = 'PC',
  H5 = 'H5',
}

export class EduClassroomConfig {
  private static _classroomConfig?: EduClassroomConfig;
  static get shared(): EduClassroomConfig {
    if (!this._classroomConfig) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CLASSROOM_CONFIG_NOT_READY,
        new Error(`classroom config not ready`),
      );
    }
    return this._classroomConfig;
  }
  static setConfig(config: EduClassroomConfig) {
    this._classroomConfig = config;
  }

  readonly appId: string;
  readonly recordUrl: string;
  readonly platform: Platform;
  private readonly _rteEngineConfig: AgoraRteEngineConfig;
  private _sessionInfo?: EduSessionInfo;
  private _courseWareList?: CloudDriveResource[];
  private _widgets: { [key: string]: IAgoraWidget } = {};
  private _extensions?: IAgoraExtensionApp[];
  private _currentAPIVersion = 'v3';
  private _compatibleVersions: string[] = [];
  private _i18nResources = {};
  private _openCameraDeviceAfterLaunch = true;
  private _openRecordingDeviceAfterLaunch = true;
  boardDefaults: WhiteboardDefaults = { scale: 1.2 };
  //by default use https://api.sd-rtn.com
  host: string = 'https://api.sd-rtn.com';
  ignoreUrlRegionPrefix: boolean = false;
  get headers(): Record<string, string | number> {
    return {
      'Content-Type': 'application/json',
      'x-agora-token': this.sessionInfo?.token || '',
      'x-agora-uid': this.sessionInfo?.userUuid || '',
    };
  }
  constructor(
    appId: string,
    sessionInfo: EduSessionInfo,
    recordUrl: string,
    rteOpts?: AgoraRteOptions,
    widgets: { [key: string]: IAgoraWidget } = {},
    platform: Platform = Platform.PC,
    i18nResources: Resource = {},
    extensions: IAgoraExtensionApp[] = [],
    options?: {
      openCameraDeviceAfterLaunch: boolean;
      openRecordingDeviceAfterLaunch: boolean;
    },
  ) {
    this.appId = appId;
    this.platform = platform;
    this._sessionInfo = sessionInfo;
    this.recordUrl = recordUrl;
    if (options) {
      this._openCameraDeviceAfterLaunch = options.openCameraDeviceAfterLaunch;
      this._openRecordingDeviceAfterLaunch = options.openRecordingDeviceAfterLaunch;
    }
    const rtcConfigs = merge(
      {
        defaultCameraEncoderConfigurations: EduClassroomConfig.defaultMediaOptions(
          sessionInfo.roomType,
          sessionInfo.role,
        ),
      },
      rteOpts?.rtcConfigs,
    );
    this._rteEngineConfig = new AgoraRteEngineConfig(appId, {
      rtcSDKParameters: [
        {
          'rtc.report_app_scenario': {
            appScenario: sessionInfo.roomType,
            serviceType: 0,
            appVersion: EDU_SDK_VERSION,
          },
        },
      ],
      ...rteOpts,
      rtcConfigs,
    });
    this._widgets = widgets;
    this._extensions = extensions;

    AgoraRteEngineConfig.setConfig(this._rteEngineConfig);

    Logger.info(
      `[Core] core configurations initialized, rte: v${AgoraRteEngine.getVersion()}, core: ${EduClassroomConfig.getVersion()}`,
    );

    this._i18nResources = i18nResources;
  }

  get i18nResources() {
    return this._i18nResources;
  }

  get sessionInfo(): EduSessionInfo {
    if (!this._sessionInfo) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_SESSION_INFO_NOT_READY,
        new Error(`session info is undefined, not logged in?`),
      );
    }

    // handleThrowableError will throw an error so it's not possible to return undefined here
    return this._sessionInfo;
  }

  setCompatibleVersions(compatibleVersions: string[]) {
    this._compatibleVersions = compatibleVersions;
  }

  get isLowAPIVersionCompatibleRequired() {
    return this._compatibleVersions.some((v) => {
      return v < this._currentAPIVersion;
    });
  }

  setCourseWareList(list?: CourseWareList) {
    const resourceList = list?.map((data: CourseWareItem) => CloudDriveResource.fromData(data));
    this._courseWareList = resourceList;
  }

  get courseWareList(): CloudDriveResource[] {
    return this._courseWareList || [];
  }

  get rteEngineConfig(): AgoraRteEngineConfig {
    this._rteEngineConfig.service.host = this.host;
    this._rteEngineConfig.ignoreUrlRegionPrefix = this.ignoreUrlRegionPrefix;
    if (this.sessionInfo) {
      this._rteEngineConfig.token = this.sessionInfo.token;
    }
    return this._rteEngineConfig;
  }

  get widgets() {
    return this._widgets;
  }

  get extensions() {
    return this._extensions;
  }

  get openCameraDeviceAfterLaunch() {
    return this._openCameraDeviceAfterLaunch;
  }

  get openRecordingDeviceAfterLaunch() {
    return this._openRecordingDeviceAfterLaunch;
  }

  static getVersion(): string {
    return EDU_SDK_VERSION;
  }

  static getRtcVersion(): string {
    return AgoraRteEngine.getRtcVersion();
  }

  static defaultMediaOptions(roomType: EduRoomTypeEnum, userRole: EduRoleTypeEnum) {
    let cameraEncoderConfiguration = {
      width: 160,
      height: 120,
      bitrate: 65,
      frameRate: 15,
    };

    if (userRole === EduRoleTypeEnum.teacher) {
      switch (roomType) {
        case EduRoomTypeEnum.Room1v1Class:
          // stay 240p
          cameraEncoderConfiguration = {
            width: 320,
            height: 240,
            frameRate: 15,
            bitrate: 200,
          };
          break;
        case EduRoomTypeEnum.RoomSmallClass:
          cameraEncoderConfiguration = {
            width: 160,
            height: 120,
            bitrate: 65,
            frameRate: 15,
          };
          break;
        case EduRoomTypeEnum.RoomBigClass:
          cameraEncoderConfiguration = {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrate: 400,
          };
          break;
      }
    } else if (userRole === EduRoleTypeEnum.student) {
      switch (roomType) {
        case EduRoomTypeEnum.Room1v1Class:
          // stay 240p
          cameraEncoderConfiguration = {
            width: 320,
            height: 240,
            frameRate: 15,
            bitrate: 200,
          };
          break;
        case EduRoomTypeEnum.RoomSmallClass:
          cameraEncoderConfiguration = {
            width: 160,
            height: 120,
            bitrate: 65,
            frameRate: 15,
          };
          break;
        case EduRoomTypeEnum.RoomBigClass:
          cameraEncoderConfiguration = {
            width: 160,
            height: 120,
            bitrate: 65,
            frameRate: 15,
          };
          break;
      }
    }
    return cameraEncoderConfiguration;
  }
}
