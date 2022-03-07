import { ToolbarUIStore } from '../common/toolbar-ui';

export class LectrueToolbarUIStore extends ToolbarUIStore {
  readonly allowedCabinetItems: string[] = ['laser', 'screenShare', 'io.agora.countdown'];
}
