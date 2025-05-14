import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

df = pd.read_json('../../data/GymShockGif.json')
df.head()

exercises = df[['bodyPart', 'equipment', 'target', 'secondaryMuscles', 'instructions', 'name']].copy()

exercises['equipment']=exercises['equipment'].apply(lambda x: x.split())
exercises['bodyPart']=exercises['bodyPart'].apply(lambda x: x.split())
exercises['target']=exercises['target'].apply(lambda x: x.split())

exercises['secondaryMuscles']=exercises['secondaryMuscles'].apply(lambda x: [i.replace(' ','') for i in x])

exercises['tags']=exercises['bodyPart'] + exercises['equipment'] + exercises['target'] + exercises['secondaryMuscles'] + exercises['instructions']

exercises['tags']=exercises['tags'].apply(lambda x: ' '.join(x))

exercises.drop(['bodyPart', 'equipment', 'target', 'secondaryMuscles', 'instructions'], axis=True, inplace=True)

cv = CountVectorizer(max_features=5000, stop_words='english')

vector = cv.fit_transform(exercises['tags']).toarray()

similarity = cosine_similarity(vector)

def recommend(exercise):
    index = exercises[exercises['name']==exercise].index[0]
    distance = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda x: x[1])[1:6]
    print([exercises.iloc[x[0]]['name'] for x in distance])

#pickle.dump(exercises, open('exercises.pkl', 'wb'))
#pickle.dump(similarity, open('similarity.pkl', 'wb'))