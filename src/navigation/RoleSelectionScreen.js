import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  ImageBackground 
} from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const RoleSelectionScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(buttonFadeAnim, {
      toValue: 1,
      duration: 1500,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, [buttonFadeAnim, fadeAnim]);

  return (
    <ImageBackground 
      source={require('../assets/login-background.jpg')} 
      style={styles.background}
    >
      {/* Gradient Overlay for smooth blending */}
      <LinearGradient 
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.1)']}
        style={styles.gradientOverlay}
      />

      <View style={styles.container}>
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Welcome to CityShop
        </Animated.Text>
        <Text style={styles.subtitle}>What do you want to do?</Text>

        <View style={styles.selectionContainer}>
          {/* Shopper Role */}
          <Animated.View style={[styles.roleCard, { opacity: buttonFadeAnim }]}>
            <TouchableOpacity 
              style={styles.roleButton} 
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <LottieView 
                source={require('../assets/animations/buy.json')} 
                autoPlay 
                loop 
                style={styles.animation} 
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Shopkeeper Role */}
          <Animated.View style={[styles.roleCard, { opacity: buttonFadeAnim }]}>
            <TouchableOpacity 
              style={styles.roleButton} 
              onPress={() => navigation.navigate('ShopkeeperLogin')}
              activeOpacity={0.8}
            >
              <LottieView 
                source={require('../assets/animations/sell.json')} 
                autoPlay 
                loop 
                style={styles.animation} 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ddd',
    marginBottom: 40,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  roleCard: {
    width: '45%',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  roleButton: {
    alignItems: 'center',
    width: '100%',
  },
  animation: {
    width: 120,
    height: 120,
  },
  roleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
});

export default RoleSelectionScreen;
