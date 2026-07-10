import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const Timeline = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [remarks, setRemarks] = useState([]);
  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const steps = [
    { label: 'Created', keyword: 'created', icon: 'document-outline', defaultRemark: 'Service created', status: 1 },
    { label: 'Assigned', keyword: 'assigned', icon: 'person-add-outline', status: 2, defaultRemark: 'Worker Assigned' },
    { label: 'In Progress', keyword: 'progress', icon: 'sync-outline', status: 3, defaultRemark: 'Work in progress' },

    { label: 'Completed', keyword: 'completed', icon: 'checkmark-done-outline', status: 4, defaultRemark: 'Service Completed' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get("http://172.16.16.215:5000/RWA/ServiceTransaction/all");
      const transaction = res.data.find(item => item._id === serviceId);
      if (transaction) {
        setRemarks(transaction.REMARKS || []);
        setStatus(transaction.STATUS || 1);
      }
    } catch (err) {
      console.error("Error loading remarks:", err);
    } finally {
      setRefreshing(false);
    }
  }


  useEffect(() => {
    const fetchRemarks = async () => {
      try {
        const res = await axios.get("http://172.16.16.215:5000/RWA/ServiceTransaction/all");
        const transaction = res.data.find(item => item._id === serviceId);
        if (transaction) {
          setRemarks(transaction.REMARKS || []);
          setStatus(transaction.STATUS || 1);
        }
      } catch (err) {
        console.error("Error loading remarks:", err);
      }
    };
    fetchRemarks();
  }, [serviceId]);

  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (status !== 4) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
        ])
      ).start();
    }
  }, [status]);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack('')} style={styles.backIcon}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.titled}>Timeline</Text>

        </View>
      </View>
      <ScrollView style={styles.container} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>



        <View style={styles.timeline}>
          {steps.map((step, index) => {
            const isCompleted = status > index + 1 || status === step.status;
            const isCurrent = status === index + 1;

            const matchingRemark = remarks.find(r =>
              r.text.toLowerCase().includes(step.keyword)
            );

            return (
              <View key={index} style={styles.stepContainer}>
                <View style={styles.leftColumn}>
                  {isCurrent && status !== 4 ? (
                    <Animated.View
                      style={[
                        styles.dot,
                        styles.currentDot,
                        {
                          transform: [{ scale: pulseAnim }],
                          shadowColor: '#4B7BEC',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 10,
                          elevation: 10,
                        }
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.dot,
                        isCompleted && styles.completedDot
                      ]}
                    />
                  )}

                  {index !== steps.length - 1 && (
                    <View style={[
                      styles.verticalLine,
                      isCompleted && styles.completedLine
                    ]} />
                  )}
                </View>

                <View style={styles.rightColumn}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                      name={step.icon}
                      size={18}
                      color={isCompleted || isCurrent ? '#6ba6a5' : '#999'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[
                      styles.remarkText,
                      isCompleted && styles.completedText,
                      isCurrent && styles.currentText
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {(() => {
                      if (status < step.status) return ''; // Only show for current or completed steps

                      const match = remarks.find(r => r.STATUS === step.status);

                      if (match) {
                        return `${match.text} - ${new Date(match.updatedAt).toLocaleString()}`;
                      } else {
                        const defaultTime = remarks.length > 0
                          ? new Date(remarks[0]?.updatedAt).toLocaleString()
                          : new Date().toLocaleString();
                        return `${step.defaultRemark} - ${defaultTime}`;
                      }
                    })()}
                  </Text>

                </View>

              </View>
            );
          })}
        </View>
      </ScrollView>
    </>

  );
};

export default Timeline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
    paddingTop:50
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 50,
  },
  timeline: {
    marginTop: 10,
    paddingLeft: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 50,
  },
  leftColumn: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d0d0d0',
    zIndex: 1,
  },
  completedDot: {
    backgroundColor: '#6ba6a5',
  },
  currentDot: {
    backgroundColor: '#333',
    borderColor: '#ccc',
    borderWidth: 2,
  },
  verticalLine: {
    position: 'absolute',
    top: 20,
    width: 2,
    height: 50,
    backgroundColor: '#333',
    zIndex: 0,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 20,
    flexDirection: 'column', // stack text below
    alignItems: 'flex-start', // align to left
    justifyContent: 'flex-start',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  remarkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  completedText: {
    color: '#6ba6a5',
  },
  timestamp: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
   header: {
        backgroundColor: '#ededfaff',
        elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 5
    },
    topRow: {
        position: 'relative',
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },

    backIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },

    titled: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
});
