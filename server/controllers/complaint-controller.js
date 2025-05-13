const Complaint = require("../models/Complaint");
const User = require("../models/User");

// Créer une nouvelle réclamation (pour les utilisateurs)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;

    // Vérifier que les champs requis sont présents
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Le titre et la description sont obligatoires"
      });
    }

    // Créer la nouvelle réclamation
    const newComplaint = new Complaint({
      userId,
      title,
      description,
      category: category || "other"
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: "Réclamation créée avec succès",
      complaint: newComplaint
    });
  } catch (error) {
    console.error("Erreur lors de la création de la réclamation:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la création de la réclamation"
    });
  }
};

// Obtenir toutes les réclamations d'un utilisateur (pour les utilisateurs)
exports.getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;

    const complaints = await Complaint.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réclamations:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des réclamations"
    });
  }
};

// Obtenir les détails d'une réclamation spécifique (pour les utilisateurs et les administrateurs)
exports.getComplaintDetails = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await Complaint.findById(complaintId)
      .populate("userId", "username email firstname lastname")
      .populate("adminId", "username email firstname lastname");

    // Vérifier si la réclamation existe
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Réclamation non trouvée"
      });
    }

    // Vérifier si l'utilisateur est autorisé à voir cette réclamation
    if (userRole !== "admin" && userRole !== "superadmin" && complaint.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à accéder à cette réclamation"
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la réclamation:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des détails de la réclamation"
    });
  }
};

// Obtenir toutes les réclamations (pour les administrateurs)
exports.getAllComplaints = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un administrateur ou un superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé. Seuls les administrateurs peuvent accéder à cette ressource."
      });
    }

    // Paramètres de filtrage et de pagination
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Construire le filtre
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Récupérer les réclamations avec pagination
    const complaints = await Complaint.find(filter)
      .populate("userId", "username email firstname lastname")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Compter le nombre total de réclamations pour la pagination
    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des réclamations:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des réclamations"
    });
  }
};

// Mettre à jour le statut d'une réclamation (pour les administrateurs)
exports.updateComplaintStatus = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un administrateur ou un superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé. Seuls les administrateurs peuvent mettre à jour le statut d'une réclamation."
      });
    }

    const { complaintId } = req.params;
    const { status, priority } = req.body;
    const adminId = req.user.id;

    // Vérifier que le statut est valide
    if (status && !["pending", "in-progress", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }

    // Vérifier que la priorité est valide
    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priorité invalide"
      });
    }

    // Mettre à jour la réclamation
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (status === "in-progress" || status === "resolved" || status === "rejected") {
      updateData.adminId = adminId;
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true }
    ).populate("userId", "username email firstname lastname")
      .populate("adminId", "username email firstname lastname");

    // Vérifier si la réclamation existe
    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Réclamation non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      message: "Statut de la réclamation mis à jour avec succès",
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la réclamation:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du statut de la réclamation"
    });
  }
};

// Répondre à une réclamation (pour les administrateurs)
exports.respondToComplaint = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un administrateur ou un superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé. Seuls les administrateurs peuvent répondre à une réclamation."
      });
    }

    const { complaintId } = req.params;
    const { adminResponse, status } = req.body;
    const adminId = req.user.id;

    // Vérifier que la réponse est présente
    if (!adminResponse) {
      return res.status(400).json({
        success: false,
        message: "La réponse est obligatoire"
      });
    }

    // Mettre à jour la réclamation avec la réponse
    const updateData = {
      adminResponse,
      adminId
    };

    // Mettre à jour le statut si fourni
    if (status) {
      if (!["pending", "in-progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Statut invalide"
        });
      }
      updateData.status = status;
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true }
    ).populate("userId", "username email firstname lastname")
      .populate("adminId", "username email firstname lastname");

    // Vérifier si la réclamation existe
    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Réclamation non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      message: "Réponse ajoutée avec succès",
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la réponse:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'ajout de la réponse"
    });
  }
};

// Supprimer une réclamation (pour les administrateurs)
exports.deleteComplaint = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un administrateur ou un superadmin
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé. Seuls les administrateurs peuvent supprimer une réclamation."
      });
    }

    const { complaintId } = req.params;

    const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);

    // Vérifier si la réclamation existe
    if (!deletedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Réclamation non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      message: "Réclamation supprimée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la réclamation:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de la réclamation"
    });
  }
};
