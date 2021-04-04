export const getOne = model => async (req, res) => {
  const id = req.params.id
  const userId = req.user._id
  // try {
  const doc = await model.findOne({ _id: id, createdBy: userId }).exec()
  if (!doc) {
    return res.status(400).end()
  }
  res.status(200).json({ data: doc })
  // } catch (e) {
  //   res.status(400).end()
  // }
}

export const getMany = model => async (req, res) => {
  const userId = req.user._id
  try {
    const docs = await model.find({ createdBy: userId }).exec()
    if (!docs) {
      throw new Error()
    }
    res.status(200).json({ data: docs })
  } catch (e) {
    res.status(400).end()
  }
}

export const createOne = model => async (req, res) => {
  const data = req.body
  const userId = req.user._id
  try {
    const doc = new model({ createdBy: userId, ...data })
    await doc.save()
    res.status(201).json({ data: doc })
  } catch (e) {
    res.status(400).end()
  }
}

export const updateOne = model => async (req, res) => {
  const id = req.params.id
  const userId = req.user._id
  const update = req.body
  try {
    const doc = await model
      .findOneAndUpdate(
        { _id: id, createdBy: userId },
        { createdBy: userId, ...update },
        { new: true }
      )
      .exec()
    if (!doc) {
      throw new Error()
    }
    res.status(200).json({ data: doc })
  } catch (e) {
    res.status(400).end()
  }
}

export const removeOne = model => async (req, res) => {
  const id = req.params.id
  const userId = req.user._id
  try {
    const doc = await model
      .findOneAndRemove({ _id: id, createdBy: userId })
      .exec()
    if (!doc) {
      throw new Error()
    }
    res.status(200).json({ data: doc })
  } catch (e) {
    res.status(400).end()
  }
}

export const crudControllers = model => ({
  removeOne: removeOne(model),
  updateOne: updateOne(model),
  getMany: getMany(model),
  getOne: getOne(model),
  createOne: createOne(model)
})
