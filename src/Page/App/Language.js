import React, { useEffect, useState } from 'react';
import { loadLocale } from '../../../locals'
import { Text, View, TouchableOpacity  } from 'react-native';
import { Row, Col } from 'react-native-easy-grid';

    

export default function HomeScreen()

{

    const [theme, setTheme] = useState(null)
  
    useEffect(() => {
      init()
    }, [])
  
    const init = async () => {
      await loadLocale()
    }


 return (
   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

<TouchableOpacity onPress={() => ("ar")}>

    <Text>عربي</Text>


    </TouchableOpacity>


    <Text>Home</Text>
   
   
   
   
   </View>
 );
}