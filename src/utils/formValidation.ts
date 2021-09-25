const { validationResult } = require('express-validator');

const validateForm = (validations: any) => {
    return async (req: any, res: any, next: any) => {
        await Promise.all(validations.map((validation: any) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            errors: errors.array()
        });
    };
};

export default validateForm;

