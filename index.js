import React, { Component, PropTypes } from 'react'


import {
    View,
    Text,
    Animated,
    StyleSheet,
    Dimensions,
    PanResponder,
} from 'react-native';

const {height: deviceHeight, width: deviceWidth} = Dimensions.get('window');
const left = -1 * deviceWidth;

export default class TransitionView extends Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
    };
    constructor(props) {
        super(props);

        this.av = new Animated.Value(0);
        this.bv = new Animated.Value(0);
        this.cur = 'a'; // 当前view
        this.pos = 0; // 数据指针位置
        this.state = {
            da: props.data[this.pos],
            db: props.data[this.pos + 1]
        }
    }

    static navigationOptions = {header: null};

    get panResponder() {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderRelease: this.handleSlideEvent.bind(this)
        }).panHandlers;
    }

    handleSlideEvent(evt, {dx, dy}) {
        // 左右滑动
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
            let another = this.cur === 'a' ? 'b' : 'a';

            this[another].setNativeProps({
                style: {
                    zIndex: -1
                }
            });
            if (dx < 0) {  // 左滑(下一页)
                if (this.pos === this.props.data.length - 1) return;
                if (this.pos === this.props.data.length - 2) {
                    this.props.addData();
                }
                Animated.timing(this[another + 'v'], {
                    toValue: 0,
                    duration: 1,
                }).start(() => {
                    this.setState({
                        ['d' + another]: this.props.data[++this.pos]
                    }, () => {
                        Animated.timing(this[this.cur + 'v'], {
                            toValue: 1,
                            duration: 300,
                        }).start(() => {
                            this[another].setNativeProps({
                                style: {
                                    zIndex: 1
                                }
                            });
                            this.cur = another;
                        })
                    });

                });

            } else {  // 右滑(上一页)

                if (this.pos === 0) return;
                Animated.timing(this[another + 'v'], {
                    toValue: 1,
                    duration: 1,
                }).start(() => {

                    this[another].setNativeProps({
                        style: {
                            zIndex: 1
                        }
                    });
                    this[this.cur].setNativeProps({
                        style: {
                            zIndex: -1
                        }
                    });
                    this.setState({
                        ['d' + another]: this.props.data[--this.pos]
                    }, () => {
                        Animated.timing(this[another + 'v'], {
                            toValue: 0,
                            duration: 300,
                        }).start(() => {

                            this.cur = another;
                        })
                    })

                });
            }
        }
    }

    render() {

        return <View>
            <Animated.View {...this.panResponder} ref={v => this.b = v}
                           style={[styles.page, {backgroundColor: 'blue'}, {
                               left: this.bv.interpolate({
                                   inputRange: [0, 1],
                                   outputRange: [0, left]
                               })
                           }]}>
                <Text>{this.state.db}</Text>
            </Animated.View>
            <Animated.View {...this.panResponder} ref={v => this.a = v}
                           style={[styles.page, {backgroundColor: 'red'}, {
                               left: this.av.interpolate({
                                   inputRange: [0, 1],
                                   outputRange: [0, left]
                               })
                           }]}>
                <Text>{this.state.da}</Text>
            </Animated.View>
        </View>;
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        alignSelf: 'center',
        position: 'absolute',
        width: deviceWidth,
        height: deviceHeight,
        backgroundColor: '#f4ddb5'
    }
});