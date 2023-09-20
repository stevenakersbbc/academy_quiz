import matplotlib.pyplot as plt
import json
  
# x axis values
x = [1,2,3]
# corresponding y axis values
y = [2,4,1]
  
# plotting the points 
plt.plot(x, y)
  
# naming the x axis
plt.xlabel('x - axis')
# naming the y axis
plt.ylabel('y - axis')
  
# giving a title to my graph
plt.title('My first graph!')
  
# function to show the plot
plt.show()

json_data = json.loads(open('telemetry.json').read())
menu = True
while menu :

    menu_option = input(""" 
1 - View interest over time per subject
                        
ANY OTHER KEY - EXIT
 > """)