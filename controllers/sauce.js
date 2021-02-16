const Sauce = require('../models/Sauce');
const fs = require('fs');


// ****************** Créer une sauce ******************
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
      .catch(error => res.status(400).json({ error }));
  };

  // ****************** Afficher toutes les sauces ******************
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// ****************** Afficher une sauce en fonction de son id ******************
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// ****************** Modifier une sauce ******************
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    { 
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`  
    } : { ...req.body};
    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
        .catch(error => res.status(400).json({ error }));
};

// ****************** Supprimer une sauce ******************
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1]; 
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
                .catch(error => res.status(400).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
};

// ****************** Ajouter un "j'aime" ou "je n'aime pas" à une sauce ******************
exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // Cas ou l'utilisateur aime la sauce
            if (req.body.like == 1){
                Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: {likes: +1}, $push: {usersLiked: req.body.userId}}
                )
                .then(() => res.status(200).json({ message: 'Like ajouté !' }))
                .catch(error => res.status(400).json({ error }));
            }
            // Cas ou l'utilisateur n'aime pas la sauce
            if (req.body.like == -1){
                Sauce.updateOne(
                    { _id: req.params.id},
                    {$inc: {dislikes: +1}, $push: {usersDisliked: req.body.userId}}
                )
                .then(() => res.status(200).json({ message: 'Dislike ajouté !' }))
                .catch(error => res.status(400).json({ error }));
            }
            //Cas ou l'utilisateur retire son like ou son dislike
            if (req.body.like == 0) {
                //Cas ou l'utilisateur retire son like
                const userLike = sauce.usersLiked.indexOf(req.body.userId);
                if (userLike == 1) {
                    sauce.usersLiked.slice(userLike, 1);
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {$inc: { likes: -1 }, $push: { usersLiked: {$each: [], $slice: userLike}},}
                    )
                    .then(() => res.status(200).json({ message: 'Like annulé' }))
                    .catch(error => res.status(400).json({ error }));
                } else if (userLike == -1) {
                    // Cas ou l'utilisateur retire son dislike
                    const userDislike = sauce.usersDisliked.indexOf(req.body.userId);
                    sauce.usersDisliked.slice(userDislike, 1);
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {$inc: { dislikes: -1 }, $push: { usersDisliked: {$each: [], $slice: userDislike }},}
                    )
                    .then(() => res.status(200).json({ message: 'Dislike annulé' }))
                    .catch(error => res.status(400).json({ error }));
                }
            }
        });
}