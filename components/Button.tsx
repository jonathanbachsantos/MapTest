import { style } from 'd3'
import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text, Animated} from 'react-native'

const Button = props => {
    return (
        <Animated.View>
            <TouchableOpacity onPress={props.onPress} style={props.buttonStyle}>
                <Text style={styles.text}>{props.text}</Text>
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    text: {
        textAlign: "center",
        fontSize: 12,
        color: "red",
        borderRadius: 50,
        borderColor: "#fff",
        padding: 50,
        fontWeight: "bold"
    }
})

export default Button