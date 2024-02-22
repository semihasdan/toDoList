import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Button,
  ImageBackground,
} from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
// Motive edici alıntılar listesi
const motivationalQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn’t just find you. You have to go out and get it.",
];

export default function App() {
  const [tasks, setTasks] = useState([]); // Görevlerin tutulduğu state
  const [isModalVisible, setIsModalVisible] = useState(false); // Görev ekleme modalı görünürlüğü
  const [isViewVisible, setIsViewVisible] = useState(false); // Görev detay modalı görünürlüğü
  const [taskTitle, setTaskTitle] = useState(''); // Yeni görevin başlığı
  const [taskDescription, setTaskDescription] = useState(''); // Yeni görevin açıklaması
  const [motivationalQuote, setMotivationalQuote] = useState(''); // Rastgele motive edici alıntı
  const [selectedTask, setSelectedTask] = useState(null); // Seçilen görev

  // Daha önceden kaydedilen görevleri tekrar yükleme
  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('tasks');
      if (jsonValue !== null) {
        setTasks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load tasks from AsyncStorage:', e);
    }
  };

  // Görevleri mevcut telefonun deposuna kaydetme
  const saveTasks = async () => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (e) {
      console.error('Failed to save tasks to AsyncStorage:', e);
    }
  };

  // Daha önceden kaydedilen görevleri tekrar yükleme fonksiyonunu çağırma
  useEffect(() => {
    loadTasks();
  }, []);

  // Görevler değiştiğinde depoya kaydet
  useEffect(() => {
    saveTasks();
  }, [tasks]);

  // Yeni görev ekleme işlemi
  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      description: taskDescription,
      completed: false,
      createdAt: new Date(),
  };

  // Add the new task at the beginning of the tasks array
  setTasks([newTask, ...tasks]);

  setIsModalVisible(false);
  setTaskTitle('');
  setTaskDescription('');
  };

  // Görev silme işlemi
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Görev tamamlama durumunu değiştirme işlemi
  const toggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };

  // Görev detaylarını gösterme işlemi
  const showTaskDetails = (task) => {
    setSelectedTask(task);
    setIsViewVisible(true);
    setMotivationalQuote(getRandomQuote());
  };

  // Rastgele motive edici alıntı seçme işlemi
  const getRandomQuote = () => {
    const index = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[index];
  };

  // Görev oluşturulma zamanını metin formatına dönüştürme işlemi
  const getCreatedAtText = (createdAt) => {
    const now = moment();
    const createdMoment = moment(createdAt);
    const duration = moment.duration(now.diff(createdMoment));
    let timeText;

    if (duration.asMinutes() < 60) {
      timeText = `${duration.asMinutes().toFixed(0)}m ago`;
    } else if (duration.asHours() < 24) {
      timeText = `${duration.asHours().toFixed(0)}h ago`;
    } else {
      timeText = `${duration.asDays().toFixed(0)}d ago`;
    }

    return timeText;
  };

  // Görev öğesi render işlemi
  const renderTask = ({ item }) => {
    const descriptionToShow = item.description.length > 150 ? item.description.substring(0, 150) + '...' : item.description;

    return (
      <TouchableOpacity onPress={() => showTaskDetails(item)}>
        <View style={[styles.taskItem, item.completed && styles.completedTask]}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{descriptionToShow}</Text>
            <Text style={styles.taskCreatedAt}>{getCreatedAtText(item.createdAt)}</Text>
          </View>
          <View>
          <TouchableOpacity style={styles.taskButton} onPress={() => toggleComplete(item.id)}>
              {item.completed ? (
                <MaterialIcons name="undo" size={20} color="orange" />
              ) : (
                <AntDesign name="checkcircle" size={20} color="green" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.taskButton} onPress={() => deleteTask(item.id)}>
              <FontAwesome name="trash" size={20} color="red" />
            </TouchableOpacity>          
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Ana komponentin render işlemi            
  return (
    <ImageBackground source={require('./background.jpeg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.heading}>To Do</Text>
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          style={{ width: '100%' }}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)}
          backdropOpacity={0.5}
        >
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              maxLength={50} 
            />
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              value={taskDescription}
              onChangeText={setTaskDescription}
              maxLength={300} 
            />
            <Button title="Add Task" onPress={addTask} />
          </View>
        </Modal>
        <Modal
          isVisible={isViewVisible}
          onBackdropPress={() => setIsViewVisible(false)}
          backdropOpacity={0.5}
        >
          <View style={styles.modalContainer}>
            {selectedTask && (
              <>
                <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                <Text style={styles.modalDescription}>{selectedTask.description}</Text>
                <Text style={styles.modalQuote}>NOTE: {motivationalQuote}</Text>
              </>
            )}
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedTask: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  taskDescription: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  taskCreatedAt: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  taskButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 10
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
  },
  modalQuote: {
    top: 10,
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(0, 0, 0, 0.7)',
  },
});
