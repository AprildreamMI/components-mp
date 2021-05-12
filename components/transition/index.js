function getSystemInfoSync() {
  if (systemInfo == null) {
    systemInfo = wx.getSystemInfoSync();
  }
  return systemInfo;
}

function requestAnimationFrame(cb) {
  const systemInfo = getSystemInfoSync();
  if (systemInfo.platform === 'devtools') {
    return setTimeout(() => {
      cb();
    }, 1000 / 30);
  }
  return wx
    .createSelectorQuery()
    .selectViewport()
    .boundingClientRect()
    .exec(() => {
      cb();
    });
}

const getClassNames = (name) => ({
  enter: `van-${name}-enter van-${name}-enter-active enter-class enter-active-class`,
  'enter-to': `van-${name}-enter-to van-${name}-enter-active enter-to-class enter-active-class`,
  leave: `van-${name}-leave van-${name}-leave-active leave-class leave-active-class`,
  'leave-to': `van-${name}-leave-to van-${name}-leave-active leave-to-class leave-active-class`,
});

Component({
  // 外部样式类，可以接受外部样式控制
  externalClasses: [
    'enter-class',
    'enter-active-class',
    'enter-to-class',
    'leave-class',
    'leave-active-class',
    'leave-to-class',
  ],
  behaviors: [
    Behavior({
      properties: {
        customStyle: String,
        show: {
          type: Boolean,
          value: showDefaultValue,
          observer: 'observeShow',
        },
        duration: {
          type: Number,
          value: 300,
        },
        name: {
          type: String,
          value: 'fade',
        },
      },
      data: {
        type: '',
        inited: false,
        display: false,
      },
      // mounted
      ready() {
        if (this.data.show === true) {
          this.observeShow(true, false);
        }
      },
      methods: {
        observeShow(value, old) {
          if (value === old) {
            return;
          }
          value ? this.enter() : this.leave();
        },
        enter() {
          const { duration, name } = this.data;
          const classNames = getClassNames(name);
          const currentDuration = duration;
          this.status = 'enter';
          this.$emit('before-enter');
          requestAnimationFrame(() => {
            if (this.status !== 'enter') {
              return;
            }
            this.$emit('enter');
            this.setData({
              inited: true,
              display: true,
              classes: classNames.enter,
              currentDuration,
            });
            requestAnimationFrame(() => {
              if (this.status !== 'enter') {
                return;
              }
              this.transitionEnded = false;
              this.setData({ classes: classNames['enter-to'] });
            });
          });
        },
        leave() {
          if (!this.data.display) {
            return;
          }
          const { duration, name } = this.data;
          const classNames = getClassNames(name);
          const currentDuration = duration;
          this.status = 'leave';
          this.$emit('before-leave');
          requestAnimationFrame(() => {
            if (this.status !== 'leave') {
              return;
            }
            this.$emit('leave');
            this.setData({
              classes: classNames.leave,
              currentDuration,
            });
            requestAnimationFrame(() => {
              if (this.status !== 'leave') {
                return;
              }
              this.transitionEnded = false;
              setTimeout(() => this.onTransitionEnd(), currentDuration);
              this.setData({ classes: classNames['leave-to'] });
            });
          });
        },
        onTransitionEnd() {
          if (this.transitionEnded) {
            return;
          }
          this.transitionEnded = true;
          this.$emit(`after-${this.status}`);
          const { show, display } = this.data;
          if (!show && display) {
            this.setData({ display: false });
          }
        },
      },
    })
  ],
});
